<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PushNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = \App\Models\AppSetting::get('push_notifications') ?? [];

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => \App\Models\PushNotification::latest()->paginate(20),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'     => 'required|string|max:200',
            'body'      => 'required|string',
            'icon'      => 'nullable|string',
            'link'      => 'nullable|url',
            'target'    => 'required|in:all,user,role',
            'target_id' => 'nullable|integer',
        ]);

        $notification = \App\Models\PushNotification::create($data);

        // Dispatch to users
        $query = User::where('is_active', true);
        if ($data['target'] === 'user' && $data['target_id']) {
            $query->where('id', $data['target_id']);
        } elseif ($data['target'] === 'role') {
            $query->role('user');
        }

        $users = $query->get();
        foreach ($users as $user) {
            $user->notify(new \App\Notifications\PushNotification($notification));
        }

        $notification->update(['is_sent' => true, 'sent_at' => now()]);

        return back()->with('success', "Notifikasi berhasil dikirim ke {$users->count()} pengguna.");
    }

    public function destroy(\App\Models\PushNotification $pushNotification)
    {
        $pushNotification->delete();
        return back()->with('success', 'Notifikasi berhasil dihapus.');
    }
}
