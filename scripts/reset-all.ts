import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 すべてのデータをリセットしています...')
  
  // すべてのテーブルを削除（リレーションの順序に注意）
  await prisma.calendarEvent.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.verificationToken.deleteMany({})
  await prisma.user.deleteMany({})
  
  console.log('✅ すべてのデータをリセットしました')
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

