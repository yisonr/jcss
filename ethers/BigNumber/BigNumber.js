/*
 * BigNumber
 * 以太坊中, 许多计算都会超出JavaScript整数的安全值(9007199254740991), 因此, 
 * ethers.js使用BigNumber类安全地对任何数量级的数字进行数学运算; 在ethers.js中,
 * 大多数需要返回值的操作将返回BigNumber;
 *
 */

// 创建BigNumber实例
// 可以利用ethers.BigNumber.from()函数将string, number, BigNumber等类型
// 转换为BigNumber
// https://docs.ethers.io/v5/api/utils/bignumber/#BigNumber
//
// 超过js最大安全整数的数值将不能转换
//
//
import { ethers } from "ethers";

const oneGwei = ethers.BigNumber.from("1000000000"); // 从十进制字符串生成
console.log(oneGwei)
console.log(ethers.BigNumber.from("0x3b9aca00")) // 从hex字符串生成
console.log(ethers.BigNumber.from(1000000000)) // 从数字生成

// 不能从js最大的安全整数之外的数字生成BigNumber, 下面代码会报错
// ethers.BigNumber.from(Number.MAX_SAFE_INTEGER);
console.log("js中最大安全整数：", Number.MAX_SAFE_INTEGER)

// BigNumber 运算
// BigNumber支持很多运算, 例如加减乘除、取模mod, 幂运算pow, 绝对值abs等运算:
console.group('\n 运算');
console.log("加法: ", oneGwei.add(1).toString())
console.log("减法: ", oneGwei.sub(1).toString())
console.log("乘法: ", oneGwei.mul(2).toString())
console.log("除法: ", oneGwei.div(2).toString())
// 比较
console.log("是否相等: ", oneGwei.eq("1000000000"))
console.groupEnd();


// 单位转换
// Name				Decimal
// wei				0
// kwei				3
// mwei				6
// gwei				9   gas费单位
// szabo			12  萨博
// finney			15  芬尼
// ether			18  以太


// 在应用中经常将数值在用户可读的字符串(以ether为单位)和机器可读的数值
// (以wei为单位)之间转换; 例如, 钱包可以为用户界面指定余额(以ether为单位)
// 和gas价格(以gwei为单位), 但是在发送交易时, 两者都必须转换成以wei为
// 单位的数值; ethers.js提供了一些功能函数, 方便这类转换
//
// formatUnits(变量, 单位): 格式化, 小单位转大单位, 比如wei -> ether, 在显示余
// 额时很有用
// https://docs.ethers.io/v5/api/utils/display-logic/#utils-parseUnits
console.group('\n 格式化: 小单位转大单位, formatUnits');
console.log(ethers.utils.formatUnits(oneGwei, 0));
// '1000000000'
console.log(ethers.utils.formatUnits(oneGwei, "gwei"));
// '1.0'
console.log(ethers.utils.formatUnits(oneGwei, 9));
// '1.0'
console.log(ethers.utils.formatUnits(oneGwei, "ether"));
// `0.000000001`
console.log(ethers.utils.formatUnits(1000000000, "gwei"));
// '1.0'
console.log(ethers.utils.formatEther(oneGwei));
// `0.000000001` 等同于formatUnits(value, "ether")
console.groupEnd();

// parseUnits: 解析, 大单位转小单位，比如ether -> wei, 在将用户输入的值转
// 为wei为单位的数值很有用
// https://docs.ethers.io/v5/api/utils/display-logic/#utils-parseUnits
console.group('\n 解析: 大单位转小单位, parseUnits');
console.log(ethers.utils.parseUnits("1.0").toString());
// { BigNumber: "1000000000000000000" }
console.log(ethers.utils.parseUnits("1.0", "ether").toString());
// { BigNumber: "1000000000000000000" }
console.log(ethers.utils.parseUnits("1.0", 18).toString());
// { BigNumber: "1000000000000000000" }
console.log(ethers.utils.parseUnits("1.0", "gwei").toString());
// { BigNumber: "1000000000" }
console.log(ethers.utils.parseUnits("1.0", 9).toString());
// { BigNumber: "1000000000" }
console.log(ethers.utils.parseEther("1.0").toString());
// { BigNumber: "1000000000000000000" } 等同于parseUnits(value, "ether")
console.groupEnd();



