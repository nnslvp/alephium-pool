# Alephium mining pool

**Fee: 0.5%**

Payment once an hour

RUS Telegram chat: https://t.me/alephium_pool

ENG Telegram chat: https://t.me/alephium_pool_eng

Discord: https://discord.gg/ZXYU2NGx

Telegram bot with current balance: https://t.me/alephium_pool_bot

Pool address: **pool.alephium-pool.com** Port: **20032**

### You can use [Official miner](https://github.com/yahorbukhta/alephium-pool/releases) or [BzMiner](https://github.com/bzminer/bzminer)

# Quick Start

**Start by downloading [Alephium Wallet](https://github.com/alephium/alephium-wallet/releases)**

## Our miner:
### Windows & Linux
1. Download last release and unzip files
2. Update `address` to your wallet in **config.json**
3. (optional) Also you can change `workerName`   
4. Run **nvidia_run** or **amd_run** (Linux: `sh nvidia_run` or `sh amd_run`)
5. **PROFIT!**

### HiveOS:
- Installation URL: https://github.com/yahorbukhta/alephium-pool/releases/download/v0.2/alephium-1.32.tar.gz
- Hash algorithm: blake3-alph
- Wallet and worker template: %WAL%
- Pool URL: pool.alephium-pool.com:20032
- [How to install a custom miner on HiveOS](https://hiveon.com/getting_started-start_custom_miner/)

## Bzminer:

1. Download [last release of BzMiner](https://github.com/bzminer/bzminer/releases) and unzip files
2. Update **alph** file to ``bzminer -a alph -w your_wallet_address -p stratum+tcp://pool.alephium-pool.com:20032``
3. Run **alph** file
4. **PROFIT!**

## TODO:

- Statistic service
