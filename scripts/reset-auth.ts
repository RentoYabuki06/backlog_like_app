import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 認証データをリセットしています...')
  
  // セッションとアカウント情報を削除
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  
  console.log('✅ 認証データをリセットしました')
  console.log('📝 次のステップ:')
  console.log('   1. ブラウザで http://localhost:3000 にアクセス')
  console.log('   2. Googleでログイン')
  console.log('   3. すべての権限を許可')
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

