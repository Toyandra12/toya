<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\Voucher;
use App\Services\TransactionService;
use App\Services\DigiflazzService;
use App\Services\ApiGamesService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(
        private TransactionService $transactionService,
        private DigiflazzService   $digiflazz,
        private ApiGamesService    $apiGames,
    ) {}

    /**
     * Show checkout page for a product
     */
    public function show(Product $product)
    {
        abort_unless($product->is_available, 404);

        $product->load('brand', 'category');

        return Inertia::render('User/Checkout', [
            'product'       => $product,
            'clientKey'     => config('toya.midtrans.client_key'),
            'userSaldo'     => Auth::user()->saldo,
        ]);
    }

    /**
     * Inquiry – validate customer ID before order (game/PLN)
     */
    public function inquiry(Request $request)
    {
        $request->validate([
            'product_id'  => 'required|exists:products,id',
            'customer_no' => 'required|string',
            'zone_id'     => 'nullable|string',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->supplier === 'apigames') {
            $result = $this->apiGames->inquiry(
                $product->supplier_code,
                $request->customer_no,
                $request->zone_id ?? ''
            );
            return response()->json($result);
        }

        if ($product->type === 'postpaid' && $product->supplier === 'digiflazz') {
            $refId  = 'INQ-' . uniqid();
            $result = $this->digiflazz->inquiry(
                $request->customer_no,
                $product->supplier_code,
                $refId
            );
            return response()->json($result);
        }

        return response()->json(['status' => true, 'message' => 'OK']);
    }

    /**
     * Place order
     */
    public function order(Request $request)
    {
        $request->validate([
            'product_id'      => 'required|exists:products,id',
            'customer_no'     => 'required|string|max:100',
            'customer_data'   => 'nullable|array',
            'payment_method'  => 'required|in:midtrans,saldo',
            'voucher_code'    => 'nullable|string',
            'is_gift'         => 'nullable|boolean',
            'gift_recipient'  => 'nullable|string',
            'gift_message'    => 'nullable|string|max:255',
        ]);

        $user    = Auth::user();
        $product = Product::findOrFail($request->product_id);

        abort_unless($product->is_available, 422, 'Produk tidak tersedia.');

        $giftData = [];
        if ($request->is_gift) {
            $giftData = [
                'recipient_contact' => $request->gift_recipient,
                'message'           => $request->gift_message,
            ];
        }

        $transaction = $this->transactionService->createTransaction(
            user:          $user,
            product:       $product,
            customerNo:    $request->customer_no,
            customerData:  $request->customer_data ?? [],
            paymentMethod: $request->payment_method,
            voucherCode:   $request->voucher_code,
            isGift:        $request->boolean('is_gift'),
            giftData:      $giftData,
        );

        // Saldo payment
        if ($request->payment_method === 'saldo') {
            $paid = $this->transactionService->payWithSaldo($transaction);
            if (!$paid) {
                $transaction->delete();
                return response()->json(['success' => false, 'message' => 'Saldo tidak cukup.'], 422);
            }
            // Start fulfillment
            $this->transactionService->processFulfillment($transaction);

            return response()->json([
                'success'        => true,
                'invoice_number' => $transaction->invoice_number,
                'redirect'       => route('user.transaction.show', $transaction->invoice_number),
            ]);
        }

        // Midtrans payment
        $snapResult = $this->transactionService->createMidtransPayment($transaction);
        if (!$snapResult['success']) {
            $transaction->delete();
            return response()->json(['success' => false, 'message' => 'Gagal membuat pembayaran.'], 422);
        }

        return response()->json([
            'success'        => true,
            'snap_token'     => $snapResult['token'],
            'redirect_url'   => $snapResult['redirect_url'],
            'invoice_number' => $transaction->invoice_number,
        ]);
    }

    /**
     * Validate voucher code
     */
    public function validateVoucher(Request $request)
    {
        $request->validate([
            'code'   => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $voucher = Voucher::where('code', strtoupper($request->code))->first();

        if (!$voucher || !$voucher->isValid(Auth::id(), $request->amount)) {
            return response()->json(['valid' => false, 'message' => 'Voucher tidak valid atau sudah habis.']);
        }

        $discount = $voucher->calculateDiscount($request->amount);

        return response()->json([
            'valid'    => true,
            'discount' => $discount,
            'voucher'  => [
                'code'           => $voucher->code,
                'name'           => $voucher->name,
                'discount_type'  => $voucher->discount_type,
                'discount_value' => $voucher->discount_value,
            ],
        ]);
    }
}
