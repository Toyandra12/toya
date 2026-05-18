<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Produk</h1>
        <div class="flex gap-2">
          <button @click="importModal = true" class="btn-secondary">⬇ Import Digiflazz</button>
          <button @click="openModal()" class="btn-primary">+ Tambah Produk</button>
        </div>
      </div>

      <div class="card p-4 flex flex-wrap gap-3">
        <input v-model="f.search" type="text" placeholder="Cari nama produk..." class="input flex-1 min-w-48" @keydown.enter="apply" />
        <select v-model="f.category_id" class="input w-40" @change="apply">
          <option value="">Semua Kategori</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <button @click="apply" class="btn-primary">Filter</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Produk</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Supplier</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Modal</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Jual</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="p in products.data" :key="p.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ p.name }}</p>
                <p class="text-xs text-gray-400">{{ p.sku }} · {{ p.brand?.name }}</p>
              </td>
              <td class="px-4 py-3"><span class="badge badge-info capitalize">{{ p.supplier }}</span></td>
              <td class="px-4 py-3 text-right text-gray-600">{{ formatRupiah(p.base_price) }}</td>
              <td class="px-4 py-3 text-right font-bold text-primary-700">{{ formatRupiah(p.sell_price) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex justify-center gap-1">
                  <span :class="p.is_active ? 'badge-success' : 'badge-danger'" class="badge">{{ p.is_active ? 'Aktif' : 'Nonaktif' }}</span>
                  <span v-if="p.is_flash_sale" class="badge badge-danger">Flash</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center flex justify-center gap-2">
                <button @click="openModal(p)" class="text-primary-600 text-xs font-medium">Edit</button>
                <button @click="destroy(p)" class="text-red-500 text-xs font-medium">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
          <div class="p-6 border-b flex justify-between"><h2 class="text-lg font-bold">{{ editing ? 'Edit' : 'Tambah' }} Produk</h2><button @click="modal=false">✕</button></div>
          <form @submit.prevent="submit" class="p-6 grid grid-cols-2 gap-4">
            <div><label class="label">Kategori</label><select v-model="form.category_id" class="input" required><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
            <div><label class="label">Brand</label><select v-model="form.brand_id" class="input" required><option v-for="b in filteredBrands" :key="b.id" :value="b.id">{{ b.name }}</option></select></div>
            <div class="col-span-2"><label class="label">Nama Produk</label><input v-model="form.name" type="text" class="input" required /></div>
            <div><label class="label">SKU</label><input v-model="form.sku" type="text" class="input" required /></div>
            <div><label class="label">Supplier</label><select v-model="form.supplier" class="input"><option value="digiflazz">Digiflazz</option><option value="apigames">API Games</option><option value="manual">Manual</option></select></div>
            <div><label class="label">Kode Supplier</label><input v-model="form.supplier_code" type="text" class="input" placeholder="buyer_sku_code" /></div>
            <div><label class="label">Tipe</label><select v-model="form.type" class="input"><option value="prepaid">Prepaid</option><option value="postpaid">Postpaid</option><option value="token">Token</option><option value="voucher">Voucher</option></select></div>
            <div><label class="label">Harga Modal</label><input v-model="form.base_price" type="number" class="input" required /></div>
            <div><label class="label">Harga Jual</label><input v-model="form.sell_price" type="number" class="input" required /></div>
            <div><label class="label">Urutan</label><input v-model="form.sort_order" type="number" class="input" /></div>
            <div class="col-span-2 flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer"><input v-model="form.is_active" type="checkbox" class="rounded" /><span class="text-sm">Aktif</span></label>
              <label class="flex items-center gap-2 cursor-pointer"><input v-model="form.is_featured" type="checkbox" class="rounded" /><span class="text-sm">Featured</span></label>
              <label class="flex items-center gap-2 cursor-pointer"><input v-model="form.is_flash_sale" type="checkbox" class="rounded" /><span class="text-sm">Flash Sale</span></label>
            </div>
            <template v-if="form.is_flash_sale">
              <div><label class="label">Harga Flash Sale</label><input v-model="form.flash_sale_price" type="number" class="input" /></div>
              <div><label class="label">Flash Sale Berakhir</label><input v-model="form.flash_sale_ends_at" type="datetime-local" class="input" /></div>
            </template>
            <div class="col-span-2 flex justify-end gap-3 pt-2"><button type="button" @click="modal=false" class="btn-secondary">Batal</button><button type="submit" class="btn-primary">Simpan</button></div>
          </form>
        </div>
      </div>

      <!-- Import Modal -->
      <div v-if="importModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
          <h2 class="font-bold text-gray-900">Import dari Digiflazz</h2>
          <p class="text-sm text-gray-500">Pilih brand tujuan import produk Digiflazz.</p>
          <div><label class="label">Brand</label><select v-model="importBrandId" class="input"><option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option></select></div>
          <div class="flex justify-end gap-3"><button @click="importModal=false" class="btn-secondary">Batal</button><button @click="doImport" class="btn-primary">Import</button></div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ products: Object, categories: Array, brands: Array, filters: Object });
const modal = ref(false);
const importModal = ref(false);
const importBrandId = ref('');
const editing = ref(null);
const f = reactive({ search: props.filters?.search ?? '', category_id: props.filters?.category_id ?? '' });
const form = reactive({ category_id: '', brand_id: '', name: '', sku: '', supplier: 'digiflazz', supplier_code: '', type: 'prepaid', base_price: 0, sell_price: 0, sort_order: 0, is_active: true, is_featured: false, is_flash_sale: false, flash_sale_price: null, flash_sale_ends_at: null });

const filteredBrands = computed(() => form.category_id ? props.brands.filter(b => b.category_id == form.category_id) : props.brands);

function apply() { router.get(route('admin.products.index'), f, { preserveState: true, replace: true }); }

function openModal(p = null) {
  editing.value = p;
  Object.assign(form, p ? { category_id: p.category_id, brand_id: p.brand_id, name: p.name, sku: p.sku, supplier: p.supplier, supplier_code: p.supplier_code ?? '', type: p.type, base_price: p.base_price, sell_price: p.sell_price, sort_order: p.sort_order, is_active: p.is_active, is_featured: p.is_featured, is_flash_sale: p.is_flash_sale, flash_sale_price: p.flash_sale_price, flash_sale_ends_at: p.flash_sale_ends_at }
    : { category_id: '', brand_id: '', name: '', sku: '', supplier: 'digiflazz', supplier_code: '', type: 'prepaid', base_price: 0, sell_price: 0, sort_order: 0, is_active: true, is_featured: false, is_flash_sale: false, flash_sale_price: null, flash_sale_ends_at: null });
  modal.value = true;
}

function submit() {
  const opts = { onSuccess: () => { modal.value = false; } };
  editing.value ? router.put(route('admin.products.update', editing.value.id), form, opts) : router.post(route('admin.products.store'), form, opts);
}

function destroy(p) {
  if (!confirm(`Hapus produk "${p.name}"?`)) return;
  router.delete(route('admin.products.destroy', p.id));
}

function doImport() {
  if (!importBrandId.value) return;
  router.post(route('admin.products.import-digiflazz'), { brand_id: importBrandId.value }, { onSuccess: () => { importModal.value = false; } });
}

function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
</script>
