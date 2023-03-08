/*
 *	监听合约事件
 *  在ethersjs中合约对象有一个contract.on的监听方法, 可以持续监听合约的事件:
 *  contract.on("eventName", function)
 *
 *  合约对象的 contract.once 方法, 可以只监听一次合约释放事件
 *  contract.once("eventName", function)
 *
 *
 *
 *
 *
 *
 */


import { ethers } from "ethers";


// 1. 声明provider
// Alchemy是一个免费的ETH节点提供商, 需要申请
// 参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md
// 准备 alchemy API
const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN';
// 连接主网 provider
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_URL);

// 2. 声明合约变量
// 可以在etherscan上找到合约合约的函数和事件的abi
// USDT的合约地址
const contractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
// 构建USDT的Transfer的ABI
const abi = [
  "event Transfer(address indexed from, address indexed to, uint value)"
];
// 生成USDT合约对象
const contractUSDT = new ethers.Contract(contractAddress, abi, provider)

// 3. 利用contract.once()函数, 监听一次Transfer事件
console.log("\n1. 利用contract.once(), 监听一次Transfer事件");
contractUSDT.once('Transfer', (from, to, value)=>{
  // 打印结果
  console.log(
    `${from} -> ${to} ${ethers.utils.formatUnits(ethers.BigNumber.from(value),6)}`
  )
})

// 4. 利用contract.on()函数, 持续监听Transfer事件
  // 持续监听USDT合约
console.log("\n2. 利用contract.on(), 持续监听Transfer事件");
contractUSDT.on('Transfer', (from, to, value)=>{
  console.log(
  // 打印结果
    `${from} -> ${to} ${ethers.utils.formatUnits(ethers.BigNumber.from(value),6)}`
  )
})




