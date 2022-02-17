# Alephium mining pool

**Fee: 0.5%**

Payment once an hour

RUS Telegram chat: https://t.me/alephium_pool

ENG Telegram chat: https://t.me/alephium_pool_eng

Discord: https://discord.gg/ZXYU2NGx

Telegram bot with current balance: https://t.me/alephium_pool_bot

### Pool servers:

* Region auto detection: **detect-my-region.alephium-pool.com:20032** (SSL: **20033**)
* Europe/Russia: **eu1.alephium-pool.com:20032** (SSL: **20033**)
* US: **us1.alephium-pool.com:20032** (SSL: **20033**)
* Asia: **asia1.alephium-pool.com:20032** (SSL: **20033**)

# Quick Start

**Start by downloading [Alephium Wallet](https://github.com/alephium/alephium-wallet/releases)**

## HiveOS:

You can use: [lolMiner](https://github.com/Lolliedieb/lolMiner-releases/releases)
, [BzMiner](https://github.com/bzminer/bzminer/releases) or [T-Rex](https://github.com/trexminer/T-Rex/releases) for
HiveOS.

## Our miner:

- Installation URL: https://github.com/yahorbukhta/alephium-pool/releases/download/v0.2/alephium-1.32.tar.gz
- Hash algorithm: blake3-alph
- Wallet and worker template: %WAL%
- Pool URL: ``detect-my-region.alephium-pool.com:20032``
- [How to install a custom miner on HiveOS](https://hiveon.com/getting_started-start_custom_miner/)

### Windows & Linux

## lolMiner:

1. Download [last release of lolMiner](https://github.com/Lolliedieb/lolMiner-releases/releases) and unzip files
2. Update **alph** file, for example: **dual_mine_eth_aleph.bat**

   ````
   set "ALEPHPOOL=detect-my-region.alephium-pool.com:20032"
   set "ALEPHWALLET=your_wallet"
   ````

3. Run **alph** file, for example: **dual_mine_eth_aleph.bat**
4. **PROFIT!**

## Bzminer:

1. Download [last release of BzMiner](https://github.com/bzminer/bzminer/releases) and unzip files
2. Update **alph** file
   to ``bzminer -a alph -w your_wallet_address -p stratum+tcp://detect-my-region.alephium-pool.com:20032``
3. Run **alph** file
4. **PROFIT!**

## T-Rex:

1. Download [last release of T-Rex](https://github.com/trexminer/T-Rex/releases) and unzip files
2. Update **alph** file
   to ``t-rex.exe -a blake3 -o stratum+tcp://detect-my-region.alephium-pool.com:20032 -u your_wallet_address -p x -w rig0``
3. Run **alph** file
4. **PROFIT!**

## Our miner:

1. Download last release and unzip files
2. Update `address` to your wallet in **config.json**
3. (optional) Also you can change `workerName`
4. Run **nvidia_run** or **amd_run** (Linux: `sh nvidia_run` or `sh amd_run`)
5. **PROFIT!**
