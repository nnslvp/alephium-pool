# Alephium mining pool

Site: https://alephium-pool.com

**Fee: 0.5%**

Telegram community: https://t.me/alephium_pool

Telegram bot with current balance: https://t.me/alephium_pool_bot

Web statistics: https://alephium-pool.com/stats.html

### Pool servers:

- Region auto detection: **detect-my-region.alephium-pool.com:20032**
- Europe: **eu1.alephium-pool.com:20032** (SSL: **20033**)
- Russia: **ru1.alephium-pool.com:20032** (SSL: **20033**)
- US: **us1.alephium-pool.com:20032**
- Asia: **asia1.alephium-pool.com:20032**

# Quick Start

**Start by downloading [Alephium Wallet](https://github.com/alephium/alephium-wallet/releases)**

## Miners:

You can use:

- [SRBMiner](https://github.com/doktor83/SRBMiner-Multi/releases)
- [lolMiner](https://github.com/Lolliedieb/lolMiner-releases/releases)
- [BzMiner](https://github.com/bzminer/bzminer/releases)
- [T-Rex](https://github.com/trexminer/T-Rex/releases)
- [Rigel](https://github.com/rigelminer/rigel/releases)
- [WildRig Multi](https://github.com/andru-kun/wildrig-multi/releases)
- About other solutions you can ask in telegram community: https://t.me/alephium_pool

### Windows examples:

## lolMiner:

1. Download [last release of lolMiner](https://github.com/Lolliedieb/lolMiner-releases/releases) and unzip files
2. Update **alph** file, for example: **dual_mine_eth_aleph.bat**

   ```
   set "ALEPHPOOL=detect-my-region.alephium-pool.com:20032"
   set "ALEPHWALLET=your_wallet"
   ```

3. Run **alph** file, for example: **dual_mine_eth_aleph.bat**
4. **PROFIT!**

## Bzminer:

1. Download [last release of BzMiner](https://github.com/bzminer/bzminer/releases) and unzip files
2. Update **alph** file
   to `bzminer -a alph -w your_wallet_address -p stratum+tcp://detect-my-region.alephium-pool.com:20032`
3. Run **alph** file
4. **PROFIT!**

## T-Rex:

1. Download [last release of T-Rex](https://github.com/trexminer/T-Rex/releases) and unzip files
2. Update **alph** file
   to `t-rex.exe -a blake3 -o stratum+tcp://detect-my-region.alephium-pool.com:20032 -u your_wallet_address -p x -w rig0`
3. Run **alph** file
4. **PROFIT!**

## SRBMiner:

1. Download [last release of SRBMiner](https://github.com/doktor83/SRBMiner-Multi/releases) and unzip files
2. Update **alph** file
   to `SRBMiner-MULTI.exe --disable-cpu --algorithm blake3_alephium --pool detect-my-region.alephium-pool.com:20032 --wallet your_wallet_address`
3. Run **alph** file
4. **PROFIT!**
