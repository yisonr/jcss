/*
 * 过滤器
 *
 * 当合约创建日志(释放事件)时, 最多可以包含[4]条数据作为索引(indexed), 索引
 * 数据经过哈希处理并包含在布隆过滤器中, 这是一种允许有效过滤的数据结构; 因此, 
 * 一个事件过滤器最多包含4个主题集, 每个主题集是个条件, 用于筛选目标事件;
 * 规则：
 * 如果一个主题集为null, 则该位置的日志主题不会被过滤, 任何值都匹配
 * 如果主题集是单个值, 则该位置的日志主题必须与该值匹配
 * 如果主题集是数组, 则该位置的日志主题至少与数组中其中一个匹配
 *
 * 构建过滤器
 * ethers.js中的合约类提供了contract.filters来简化过滤器的创建:
 * const filter = contract.filters.EVENT_NAME( ...args )
 *
 * 其中EVENT_NAME为要过滤的事件名, args为主题集/条件:
 * 1. 过滤来自myAddress地址的Transfer事件
 *    contract.filters.Transfer(myAddress)
 *
 * 2. 过滤所有发给 myAddress地址的Transfer事件
 *	  contract.filters.Transfer(null, myAddress)
 *
 * 3. 过滤所有从 myAddress发给otherAddress的Transfer事件
 *	  contract.filters.Transfer(myAddress, otherAddress)
 *    
 * 4. 过滤所有发给myAddress或otherAddress的Transfer事件
 *    contract.filters.Transfer(null, [ myAddress, otherAddress ])
 *
 *
 * 可以监听任何感兴趣的交易, 发现smart money做了哪些新交易, NFT大佬冲了
 * 哪些新项目等等
 */


import { ethers } from "ethers";

const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN';
// 连接主网 provider
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_URL);

// 合约地址
const addressUSDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'
// 交易所地址
const accountBinance = '0x28C6c06298d514Db089934071355E5743bf21d60'
// 构建ABI
const abi = [
  "event Transfer(address indexed from, address indexed to, uint value)",
  "function balanceOf(address) public view returns(uint)",
];
// 构建合约对象
const contractUSDT = new ethers.Contract(addressUSDT, abi, provider)

// 读取币安热钱余额
const balanceUSDT = await contractUSDT.balanceOf(accountBinance)
console.log(`USDT余额: ${ethers.utils.formatUnits(ethers.BigNumber.from(balanceUSDT),6)}\n`)

// 构造过滤器, 监听USDT转入币安的事件
let filterBinanceIn = contractUSDT.filters.Transfer(null, accountBinance);
console.log("过滤器详情: ")
console.log(filterBinanceIn);

contractUSDT.on(filterBinanceIn, (from, to, value) => {
	console.log('---------监听USDT进入交易所--------');
	console.log(
		`${from} -> ${to} ${ethers.utils.formatUnits(ethers.BigNumber.from(value),6)}`
	)}).on('error', (error) => {
  console.log(error)
})


