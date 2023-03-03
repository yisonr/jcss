/*
 *	创建可写 contract 变量
 *	const contract = new ethers.Contract(address, abi, signer)
 *	其中address为合约地址, abi是合约的abi接口, signer是wallet对象; 这里需要
 *	提供signer, 而在声明可读合约时你只需要提供provider
 *
 *	可以利用下面的方法, 将可读合约转换为可写合约:
 *	const contract2 = contract.connect(signer)
 *
 *
 *	合约交互
 *	写入合约信息需要构建交易并且支付gas, 交易将由整个网络上的每个节点以
 *	及矿工验证, 并改变区块链状态:
 *
 *  // 发送交易
 *	const tx = await contract.METHOD_NAME(args [, overrides])
 *  // 等待链上确认交易
 *  await tx.wait() 
 *  [, overrides]是可以选择传入的数据, 包括:
 *  - gasPrice: gas价格
 *  - gasLimit: gas上限
 *  - value: 调用时传入的 ether(单位为wei)
 *  - nonce
 *  但是此方法不能获取合约运行的返回值, 如有需要应使用 Solidity 事件记录, 然
 *  后利用交易收据去查询;
 *
 */


/* 与测试网 WETH 合约交互  
 * WETH (Wrapped ETH)是ETH的带包装版本, 将以太坊原生代币用智能合约包装成
 * 了符合ERC20的代币
 */
import { ethers } from "ethers";

// 利用Infura的rpc节点连接以太坊网络
const INFURA_API = 'https://mainnet.infura.io/v3/a863a357d92641fcaa7f794b3f81cf7d'
const provider = new ethers.providers.JsonRpcProvider(INFURA_API)

// 利用私钥和provider创建wallet对象
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// WETH的ABI
const abiWETH = [
    "function balanceOf(address) public view returns(uint)",
    "function deposit() public payable",
    "function transfer(address, uint) public returns (bool)",
    "function withdraw(uint) public",
];
// WETH合约地址（Rinkeby测试网）
const addressWETH = '0xc778417e063141139fce010982780140aa0cd5ab' // WETH Contract

// 声明可写合约
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)

const address = await wallet.getAddress()
// 读取WETH合约的链上信息（WETH abi）
console.log("\n1. 读取WETH余额")
const balanceWETH = await contractWETH.balanceOf(address)
console.log(`存款前WETH持仓: ${ethers.utils.formatEther(balanceWETH)}\n`)


console.log("\n2. 调用desposit()函数，存入0.001 ETH")
// 发起交易
const tx = await contractWETH.deposit({value: ethers.utils.parseEther("0.001")})
// 等待交易上链
await tx.wait()
console.log(`交易详情：`)
console.log(tx)
const balanceWETH_deposit = await contractWETH.balanceOf(address)
console.log(`存款后WETH持仓: ${ethers.utils.formatEther(balanceWETH_deposit)}\n`)


console.log("\n3. 调用transfer()函数，给vitalik转账0.001 WETH")
// 发起交易
const tx2 = await contractWETH.transfer("vitalik.eth", ethers.utils.parseEther("0.001"))
// 等待交易上链
await tx2.wait()
const balanceWETH_transfer = await contractWETH.balanceOf(address)
console.log(`转账后WETH持仓: ${ethers.utils.formatEther(balanceWETH_transfer)}\n`)

/*
 * deposit()函数和balanceOf()函数, 为什么前者返回一堆数据, 而后者只返回确定的值?
 * 这是因为对于钱包的余额是一个只读操作, 读到什么就是什么; 而对于一次函数的调用, 
 * 并不知道数据何时上链, 所以只会返回这次交易的信息; 
 * 对于非pure/view函数的调用, 会返回交易的信息,  如果想知道函数执行过程中合
 * 约变量的变化, 可以在合约中使用emit输出事件, 并在返回的transaction信息中读
 * 取事件信息来获取相应的值;
 */
