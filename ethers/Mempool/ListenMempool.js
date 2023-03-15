/*
 * MEV(Maximal Extractable Value, 最大可提取价值)
 * 在支持智能合约的区块链被发明之前它并不存在, 它是科学家的盛宴, 矿场的友人, 
 * 散户的噩梦;
 *
 * 在区块链中, 矿工可以通过打包、排除或重新排序(TODO: 深入理解)他们产生的区
 * 块中的交易来获得一定的利润, 而MEV是衡量这种利润的指标;
 *
 * Mempool
 * 在用户的交易被矿工打包进以太坊区块链之前, 所有交易会汇集到Mempool(交易内
 * 存池)中; 矿工也是在这里寻找费用高的交易优先打包, 实现利益最大化; 通常来说,
 * gas price越高的交易越容易被打包;
 * 同时, 一些MEV机器人也会搜索mempool中有利可图的交易; 比如, 一笔滑点设置
 * 过高的swap交易可能会被三明治攻击: (TODO: 模拟)
 * 通过调整gas, 机器人会在这笔交易之前插一个买单, 之后发送一个卖单, 
 * 等效于把代币以高价卖给用户(抢跑)
 *
 * 监听mempool(TODO: 以太坊mempool)
 * 可以使用 ethers.js的Provider 类提供的方法, 监听mempool中的pending(未决, 
 * 待打包)交易:
 * provider.on("pending", listener)
 *
 */

// 监听 mempool 脚本

import { ethers, utils } from "ethers"

//
// 1. 创建provider和wallet, 使用provider的WebSocket Provider更持久的监听交易,
// 因此需要将url换成wss的
console.log("1. 连接 wss RPC")
// 准备 alchemy API 
const ALCHEMY_MAINNET_WSSURL = 'wss://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN';
const provider = new ethers.providers.WebSocketProvider(ALCHEMY_MAINNET_WSSURL);

// 2. 因为mempool中的未决交易很多, 每秒上百个, 很容易达到免费rpc节点的请求上限, 
// 因此需要用throttle限制请求频率
function throttle(fn, delay) {
    let timer;
    return function(){
        if(!timer) {
            fn.apply(this, arguments)
            timer = setTimeout(()=>{
                clearTimeout(timer)
                timer = null
            },delay)
        }
    }
}


// 3. 创建 Interface 对象, 用于解码交易详情
// 如果输入参数是solidity的struct结构体类型时, 我们要做特殊处理, 在javascript
// 中改为tuple元组类型, 上面的exactInputSingle()函数的参数为
// ExactInputSingleParams结构体:
// struct ExactInputSingleParams {
//       address tokenIn;
//       address tokenOut;
//       uint24 fee;
//       address recipient;
//       uint256 deadline;
//       uint256 amountIn;
//       uint256 amountOutMinimum;
//       uint160 sqrtPriceLimitX96;
// }
// 在js中要写为:
const iface = new utils.Interface([
    "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint deadline, uint amountIn, uint amountOutMinimum, uint160 sqrtPriceLimitX96) calldata) external payable returns (uint amountOut)",
])


// 4. 监听mempool的未决交易, 并打印交易哈希
// let j = 0
// provider.on("pending", throttle(async (txHash) => {
//     if (txHash && j < 100) {
//         // 打印txHash
// 		// 获取tx详情
//         let tx = await provider.getTransaction(txHash);
//         console.log(`[${(new Date).toLocaleTimeString()}] 监听Pending交易 ${j}: ${txHash} \r`);
// 		console.log(tx);
//         j++
//     }
// }, 1000));

// 4. 监听pending的uniswapV3(TODO)交易, 获取交易详情并解码; 只解码通过Uniswap V3路
// 由合约的exactInputSingle()函数的交易; 网络不活跃的时候, 可能需要等待几分
// 钟才能监听到一笔
provider.on("pending", throttle(async (txHash) => {
    if (txHash) {
        // 获取tx详情
        let tx = await provider.getTransaction(txHash);
        if (tx) {
            // filter pendingTx.data
            if (tx.data.indexOf(iface.getSighash("exactInputSingle")) !== -1) { // TODO
                // 打印txHash
                console.log(`\n[${(new Date).toLocaleTimeString()}] 监听Pending交易: ${txHash} \r`);

                // 打印解码的交易详情
                let parsedTx = iface.parseTransaction(tx)
                console.log("pending交易详情解码：")
                console.log(parsedTx);
                // Input data解码
                console.log("Input Data解码：")
                console.log(parsedTx.args);
            }
        }
    }
}, 100));

// 5. 通过未决交易的哈希, 获取交易详情; 可以看到交易还未上链, 其blockHash,
// blockNumber, 和transactionIndex都为空; 但是可以获取到交易的发送者地址from,
// 燃料费gasPrice, 目标地址to, 发送的以太数额value, 发送数据data等等信息;
// 机器人就是利用这些信息进行MEV挖掘的
