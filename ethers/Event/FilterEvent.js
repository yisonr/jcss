
/*
 *	检索事件
 *	智能合约释放出的事件存储于以太坊虚拟机的日志中, 日志分为两个: 主题topics
 *	和数据data部分, 其中事件哈希和indexed变量存储在topics中, 作为索引方便以
 *	后搜索; 没有indexed的变量存储在data中, 不能被直接检索, 但可以存储更复杂的
 *	数据结构;
 *
 *
 *	可以利用Ethers中合约类型的queryFilter()函数读取合约释放的事件
 *	const transferEvents = await contract.queryFilter('事件名', 起始区块, 结束区块)
 *  检索结果为数组, 要检索的事件必须包含在合约的abi中
 *  起始区块和结束区块可以不传, TODO: 两个区块间的范围有限制吗?
 *  
 */

import { ethers } from "ethers";

// 利用Infura的rpc节点连接以太坊网络
const INFURA_API = 'https://mainnet.infura.io/v3/a863a357d92641fcaa7f794b3f81cf7d'
const provider = new ethers.providers.JsonRpcProvider(INFURA_API)


// WETH ABI, 只包含要检索的Transfer事件
const abiWETH = [
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

// 测试网WETH地址
const addressWETH = '0xc778417e063141139fce010982780140aa0cd5ab'
// 声明合约实例
const contract = new ethers.Contract(addressWETH, abiWETH, provider) // 读合约, 只需要提供 provider

// 得到当前block
const block = await provider.getBlockNumber()
console.log(`当前区块高度: ${block}`);
console.log(`打印事件详情:`);
const transferEvents = await contract.queryFilter('Transfer', block - 10, block)
// 打印第1个Transfer事件
console.log(transferEvents[0])

// 解析Transfer事件的数据(变量在args中)
console.log("\n2. 解析事件: ")
// TODO: 熟悉 ethers.utils 的常用函数
const amount = ethers.utils.formatUnits(ethers.BigNumber.from(transferEvents[0].args["amount"]), "ether");
console.log(`地址 ${transferEvents[0].args["from"]} 转账${amount} WETH 到地址 ${transferEvents[0].args["to"]}`)
