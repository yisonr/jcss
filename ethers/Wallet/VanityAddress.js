/*
 * 靓号生成器
 * 靓号地址(Vanity Address)是个性化的地址, 易于识别, 并且具有与其它地址一
 * 样的安全性, 比如以7个0开头的地址:
 * 0x0000000fe6a514a32abdcdfcc076c85243de899b
 * 这也是知名做市商Wintermute被盗$1.6亿的靓号地址, 问题出在生成靓号工具
 * 存在漏洞; Wintermute使用了一个叫Profinity的靓号生成器来生成地址, 但这
 * 个生成器的随机种子有问题; 本来随机种子应该有2的256次方可能性, 但是
 * Profinity(TODO)使用的种子只有2的32次方的长度, 可以被暴力破解;
 * 
 * 
 * 靓号生成脚本
 * 靓号生成器的逻辑非常简单, 不断生成随机钱包, 直到匹配到想要的靓号才结束,
 * 作为测试, 以0x000开头的靓号很快就可以生成, 每多一个0, 耗时多十倍;
 *
 */

import { ethers } from "ethers";

// 在js中可以用下面的表达式筛选靓号地址:
const regex = /^0x000.*$/ // 匹配以0x000开头的地址

var wallet // 钱包
var isValid = false
while(!isValid){
    wallet = ethers.Wallet.createRandom() // 随机生成钱包，安全
    isValid = regex.test(wallet.address) // 检验正则表达式
}

// 打印靓号地址与私钥
console.log(`靓号地址: ${wallet.address}`)
console.log(`靓号私钥: ${wallet.privateKey}`)
