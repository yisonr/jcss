/*
 * 批量转账
 * 空投中的Airdrop合约, 可以在一笔交易中实现批量转账, 节省gas费
 *
 * Airdrop 合约主要的2个函数:
 * - multiTransferETH(): 批量发送ETH，包含2个参数
 *   _addresses: 接收空投的用户地址数组(address[]类型)
 *   _amounts: 空投数量数组, 对应_addresses里每个地址的数量(uint[]类型)
 *
 * - multiTransferToken()函数: 批量发送ERC20代币, 包含3个参数
 *    _token: 代币合约地址(address类型)
 *    _addresses: 接收空投的用户地址数组(address[]类型)
 *    _amounts: 空投数量数组, 对应_addresses里每个地址的数量(uint[]类型)
 *
 * 在Goerli测试网部署了一个Airdrop合约, 地址为: TODO: 熟悉 airdrop 合约
 * 0x71C2aD976210264ff0468d43b198FD69772A25fa
 */

import { ethers, utils } from "ethers";

console.log("1. 创建HD钱包")
// 通过助记词生成HD钱包
const mnemonic = `air organ twist rule prison symptom jazz cheap rather dizzy verb glare jeans orbit weapon universe require tired sing casino business anxiety seminar hunt`
const hdNode = utils.HDNode.fromMnemonic(mnemonic)
console.log(hdNode);

console.log("\n2. 通过HD钱包派生20个钱包")
const numWallet = 20
// 派生路径：m / purpose' / coin_type' / account' / change / address_index
// 我们只需要切换最后一位address_index，就可以从hdNode派生出新钱包
let basePath = "m/44'/60'/0'/0";
let addresses = [];
for (let i = 0; i < numWallet; i++) {
    let hdNodeNew = hdNode.derivePath(basePath + "/" + i);
    let walletNew = new ethers.Wallet(hdNodeNew.privateKey);
    addresses.push(walletNew.address);
}
console.log(addresses)
const amounts = Array(20).fill(utils.parseEther("0.0001"))
console.log(`发送数额: ${amounts}`)

//准备 alchemy API 
const ALCHEMY_GOERLI_URL = 'https://eth-goerli.alchemyapi.io/v2/GlaeWuylnNM3uuOo-SAwJxuwTdqHaY5l';
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI_URL);

// 利用私钥和provider创建wallet对象
// 钱包地址: 0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// Airdrop的ABI
const abiAirdrop = [
    "function multiTransferToken(address,address[],uint256[]) external",
    "function multiTransferETH(address[],uint256[]) public payable",
];

// 创建 airdrop 合约
// Airdrop合约地址（Goerli测试网）
const addressAirdrop = '0x71C2aD976210264ff0468d43b198FD69772A25fa' // Airdrop Contract
// 声明Airdrop合约
const contractAirdrop = new ethers.Contract(addressAirdrop, abiAirdrop, wallet)

// 创建 WETH 合约
// WETH的ABI
const abiWETH = [
    "function balanceOf(address) public view returns(uint)",
    "function transfer(address, uint) public returns (bool)",
    "function approve(address, uint256) public returns (bool)"
];
// WETH合约地址（Goerli测试网）
const addressWETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6' // WETH Contract
// 声明WETH合约
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)

console.log("\n3. 读取一个地址的ETH和WETH余额")
//读取WETH余额
const balanceWETH = await contractWETH.balanceOf(addresses[10])
console.log(`WETH持仓: ${ethers.utils.formatEther(balanceWETH)}\n`)
//读取ETH余额
const balanceETH = await provider.getBalance(addresses[10])
console.log(`ETH持仓: ${ethers.utils.formatEther(balanceETH)}\n`)

console.log("\n4. 调用multiTransferETH()函数, 给每个钱包转 0.0001 ETH")
// 发起交易
const tx = await contractAirdrop.multiTransferETH(addresses, amounts, {value: ethers.utils.parseEther("0.001")})
// 等待交易上链
await tx.wait()
// console.log(`交易详情:`)
// console.log(tx)
const balanceETH2 = await provider.getBalance(addresses[10])
console.log(`发送后该钱包ETH持仓: ${ethers.utils.formatEther(balanceETH2)}\n`)

console.log("\n5. 调用multiTransferToken()函数，给每个钱包转 0.001 WETH")
// 先approve WETH给Airdrop合约
const txApprove = await contractWETH.approve(addressAirdrop, utils.parseEther("1"))
await txApprove.wait()
// 发起交易
const tx2 = await contractAirdrop.multiTransferToken(addressWETH, addresses, amounts)
// 等待交易上链
await tx2.wait()
// console.log(`交易详情：`)
// console.log(tx2)
// 读取WETH余额
const balanceWETH2 = await contractWETH.balanceOf(addresses[10])
console.log(`发送后该钱包WETH持仓: ${ethers.utils.formatEther(balanceWETH2)}\n`)


