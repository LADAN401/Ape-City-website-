'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { getContract } from '../lib/contract';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('1000000000');
  const [tokens, setTokens] = useState([]);
  const [status, setStatus] = useState('');

  const fetchTokens = async () => {
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const contract = getContract(provider);
    try {
      const count = await contract.getLaunchedTokensCount();
      const list = [];
      for (let i = 0; i < count; i++) {
        const t = await contract.launchedTokens(i);
        list.push({
          index: i,
          token: t.token,
          creator: t.creator,
          totalSupply: ethers.formatEther(t.totalSupply),
          ethRaised: ethers.formatEther(t.ethRaised),
          migrated: t.migrated,
        });
      }
      setTokens(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  const launchToken = async () => {
    if (!isConnected) return setStatus('Connect wallet first');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = getContract(signer);
    try {
      setStatus('Launching...');
      const tx = await contract.launchToken(name || 'Ape Token', symbol || 'APE', ethers.parseUnits(supply, 18));
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => {
        try {
          return contract.interface.parseLog(l).name === 'TokenLaunched';
        } catch {
          return false;
        }
      });
      const tokenCA = event.args.token;
      setStatus(`Success! Token CA: ${tokenCA}`);
      fetchTokens();
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className="container">
      <h1>Ape City Launchpad</h1>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={() => connect({ connector: connectors[0] })}>Connect Wallet</button>
      )}
      <button onClick={disconnect} disabled={!isConnected}>Disconnect</button>

      <h2>Launch Token</h2>
      <input placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Symbol (optional)" value={symbol} onChange={e => setSymbol(e.target.value)} />
      <input placeholder="Supply (default 1B)" value={supply} onChange={e => setSupply(e.target.value)} />
      <button onClick={launchToken} disabled={!isConnected}>Launch Token</button>
      <p>{status}</p>

      <h2>Launched Tokens</h2>
      <ul>
        {tokens.map(t => (
          <li key={t.index}>
            <strong>Token CA: {t.token}</strong><br/>
            Creator: {t.creator}<br/>
            Raised: {t.ethRaised} ETH<br/>
            Status: {t.migrated ? 'Migrated to Uniswap' : 'Bonding Curve Active'}
          </li>
        ))}
      </ul>
    </div>
  );
        } 
