/*  发送ETH
 *  
 *	Web3.js认为用户会在本地部署以太坊节点, 私钥和网络连接状态由这个节点管理(实
 *	际并不是这样); 而在ethers.js中, Provider提供器类管理网络连接状态, Signer
 *	签名者类或Wallet钱包类管理密钥, 安全且灵活;
 *
 *	在ethers中, Signer签名者类是以太坊账户的抽象, 可用于对消息和交易进行签名, 
 *	并将签名的交易发送到以太坊网络, 并更改区块链状态。
 *	Signer类是抽象类, 不能直接实例化, 需要使用它的子类: Wallet钱包类
 *
 *	Wallet钱包类
 *	Wallet类继承了Signer类, 并且开发者可以像包含私钥的外部拥有帐户(EOA)一样, 
 *	用它对交易和消息进行签名:
 *	1. 创建随机的 wallet 对象(该私钥由加密安全的熵源生成)
 *		const wallet1 = new ethers.Wallet.createRandom()
 *
 *	2. 用私钥创建wallet对象
 *		const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
 *		const wallet2 = new ethers.Wallet(privateKey, provider)
 *
 *	3. 从助记词创建wallet对象
 *		const wallet3 = new ethers.Wallet.fromMnemonic(mnemonic.phrase)
 *
 *	4. 通过JSON文件创建wallet对象
 *		可以使用 ethers.Wallet.fromEncryptedJson 解密一个JSON钱包文件创建钱
 *		包实例, JSON文件即 keystore 文件, 通常来自Geth, Parity等钱包
 *		(TODO: 通过Geth搭建过以太坊节点的个人熟悉 keystore 文件)
 */

const INFURA_API = 'https://mainnet.infura.io/v3/a863a357d92641fcaa7f794b3f81cf7d'
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider(INFURA_API)
const main = async () => {

	// 创建随机的wallet对象
	// 这种方法创建的钱包是单机的, 需要用connect(provider)函数连接到以太坊节点
	const wallet1 = ethers.Wallet.createRandom()
	const wallet1WithProvider = wallet1.connect(provider)
	const mnemonic = wallet1.mnemonic // 获取助记词

	// 利用私钥和Provider实例创建Wallet对象, 这种方法创建的钱包不能获取助记词
	const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
	const wallet2 = new ethers.Wallet(privateKey, provider)

	// 从助记词创建wallet对象
	const wallet3 = ethers.Wallet.fromMnemonic(mnemonic.phrase)

	// 获取钱包地址
	const address1 = await wallet1.getAddress()
    const address2 = await wallet2.getAddress() 
    const address3 = await wallet3.getAddress() // 获取地址
    console.log(`1. 获取钱包地址`);
    console.log(`钱包1地址: ${address1}`);
    console.log(`钱包2地址: ${address2}`);
    console.log(`钱包3地址: ${address3}`);
    console.log(`钱包1和钱包3的地址是否相同: ${address1 === address3}`);

	// 获取助记词
	console.log(`钱包1助记词: ${wallet1.mnemonic.phrase}`)

	// 获取私钥
	console.log(`钱包2私钥: ${wallet2.privateKey}`)


	// 获取钱包在链上的交互次数
	const txCount1 = await wallet1WithProvider.getTransactionCount()
    const txCount2 = await wallet2.getTransactionCount()
    console.log(`钱包1发送交易次数: ${txCount1}`)
    console.log(`钱包2发送交易次数: ${txCount2}`)

	// 发送ETH (TODO: 实验)
	// 需要连接测试网API
    // 需要在测试完水龙头领取测试币
    console.log(`\n 发送ETH（测试网）`);
    // i. 打印交易前余额
    console.log(`i. 发送前余额`)
    console.log(`钱包1: ${ethers.utils.formatEther(await wallet1WithProvider.getBalance())} ETH`)
    console.log(`钱包2: ${ethers.utils.formatEther(await wallet2.getBalance())} ETH`)
    // ii. 构造交易请求, 参数: to为接收地址，value为ETH数额
    const tx = {
        to: address1,
        value: ethers.utils.parseEther("0.001")
    }
    // iii. 发送交易，获得收据
    console.log(`\nii. 等待交易在区块链确认(需要几分钟)`)
    const receipt = await wallet2.sendTransaction(tx)
    await receipt.wait() // 等待链上确认交易
    console.log(receipt) // 打印交易详情
    // iv. 打印交易后余额
    console.log(`\niii. 发送后余额`)
    console.log(`钱包1: ${ethers.utils.formatEther(await wallet1WithProvider.getBalance())} ETH`)
    console.log(`钱包2: ${ethers.utils.formatEther(await wallet2.getBalance())} ETH`)
}

main()

