/*
 * CallStatic 
 *
 * 可能失败的交易
 * 在以太坊上发交易需要付昂贵的 gas, 并且有失败的风险, 发送失败的交易并不会
 * 返还 gas; 因此需要在发送交易前知道哪些交易可能会失败, 节省大量 gas
 *
 * callStatic
 * 在 ethers.js 中可以利用 contract 对象的 callStatic() 来调用以太坊节
 * 点的 eth_call:
 *     const tx = await contract.callStatic.函数名(参数, {override})
 *     console.log(`交易会成功吗？: `, tx)
 *
 * {override}: 选填, 可包含一下参数: TODO: 理解使用
 * - from: 执行时的 msg.sender(可以模拟任何人的调用)
 * - value: 执行时的 msg.value 
 * - blockTag: 执行时的区块高度
 * - gasPrice
 * - gasLimit
 * - nonce
 *
 *
 * ethers.js将eth_call封装在callStatic方法中, 方便开发者模拟交易的结果, 并
 * 避免发送可能失败的交易; 此方法还有更多用处, 如计算土狗币的交易滑点等(TODO)
 */

// 用 callStatic 模拟 DAI 转账
import { ethers } from "ethers";

//准备 alchemy API 可以参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md 
const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN';
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_URL);

// 利用私钥和provider创建wallet对象
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// DAI的ABI
const abiDAI = [
    "function balanceOf(address) public view returns(uint)",
    "function transfer(address, uint) public returns (bool)",
];
// DAI合约地址(主网)
const addressDAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI Contract
// 创建DAI合约实例
const contractDAI = new ethers.Contract(addressDAI, abiDAI, provider)

const address = await wallet.getAddress()
console.log("\n1. 读取测试钱包的DAI余额")
const balanceDAI = await contractDAI.balanceOf(address)
console.log(`DAI持仓: ${ethers.utils.formatEther(balanceDAI)}\n`)

console.log("\n2. 用callStatic尝试调用transfer转账1 DAI") 
// 发起交易
const tx = await contractDAI.callStatic.transfer("vitalik.eth", ethers.utils.parseEther("10000"), {from: "vitalik.eth"})
// TODO: 自己给自己转账?
console.log(`交易会成功吗？: `, tx)


console.log("\n3. 用callStatic尝试调用transfer转账1 DAI, msg.sender为测试钱包地址") 
const tx2 = await contractDAI.callStatic.transfer("vitalik.eth", ethers.utils.parseEther("10000"), {from: address})
console.log(`交易会成功吗？: `, tx2)


