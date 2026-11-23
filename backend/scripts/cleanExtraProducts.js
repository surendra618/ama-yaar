const mongoose = require('mongoose');
const uri = 'mongodb://pritamkumars5398_db_user:QX3rUpeOyl1N9Hy3@ac-gzteh4u-shard-00-00.225u19p.mongodb.net:27017,ac-gzteh4u-shard-00-01.225u19p.mongodb.net:27017,ac-gzteh4u-shard-00-02.225u19p.mongodb.net:27017/prodv3?ssl=true&replicaSet=atlas-vkxzwq-shard-0&authSource=admin&retryWrites=true&w=majority&appName=amayaar01';

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log('Connected to prodv3!');

  const allProducts = await conn.db.collection('products').find({}).toArray();
  console.log('Total products currently in DB:', allProducts.length);

  // Exact 79 Excel items:
  // - AY-SHI-101 to AY-SHI-129 (29 Shirts)
  // - AY-T-S-130 to AY-T-S-179 (50 T-Shirts)
  const toKeep = allProducts.filter(p => p.sku && (p.sku.startsWith('AY-SHI-') || p.sku.startsWith('AY-T-S-')));
  const toDelete = allProducts.filter(p => !toKeep.some(k => String(k._id) === String(p._id)));

  console.log('Products to KEEP (Excel catalog):', toKeep.length);
  console.log('Products to DELETE (extra demo & duplicates):', toDelete.length);

  console.log('\nBreakdown of products to delete:');
  const noSku = toDelete.filter(p => !p.sku);
  const duplicateTest = toDelete.filter(p => p.sku && p.sku.startsWith('AY--'));
  console.log('- Demo products with NO SKU:', noSku.length);
  console.log('- Duplicate test products with AY-- SKU:', duplicateTest.length);

  if (isDryRun) {
    console.log('\n[DRY RUN] No changes were made to the database.');
  } else {
    const deleteIds = toDelete.map(p => p._id);
    const deleteResult = await conn.db.collection('products').deleteMany({
      _id: { $in: deleteIds }
    });
    console.log('\n[DELETED]', deleteResult.deletedCount, 'products removed successfully!');

    const remainingCount = await conn.db.collection('products').countDocuments();
    console.log('Products remaining in DB:', remainingCount);

    // Also pull deleted product IDs from carts and wishlists if any to avoid dangling references
    const cartUpdate = await conn.db.collection('carts').updateMany(
      {},
      { $pull: { items: { product: { $in: deleteIds } } } }
    );
    console.log('Carts cleaned of deleted products:', cartUpdate.modifiedCount);

    const wishlistUpdate = await conn.db.collection('wishlists').updateMany(
      {},
      { $pull: { products: { $in: deleteIds } } }
    );
    console.log('Wishlists cleaned of deleted products:', wishlistUpdate.modifiedCount);
  }

  // Verify other collections untouched
  console.log('\n--- VERIFYING OTHER COLLECTIONS UNTOUCHED ---');
  const collectionsToCheck = ['categories', 'users', 'coupons', 'blogs', 'banners', 'cardsliders'];
  for (const name of collectionsToCheck) {
    const count = await conn.db.collection(name).countDocuments();
    console.log(`${name}: ${count} documents intact`);
  }

  await conn.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
