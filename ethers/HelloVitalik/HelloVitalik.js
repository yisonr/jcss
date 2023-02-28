
const INFURA_API = 'https://mainnet.infura.io/v3/a863a357d92641fcaa7f794b3f81cf7d'
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider(INFURA_API)
const main = async () => {
    const balance = await provider.getBalance(`vitalik.eth`);
    console.log(`ETH Balance of vitalik: ${ethers.utils.formatEther(balance)} ETH`);
}
main()
