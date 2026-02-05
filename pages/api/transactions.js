export default function handler(req, res) {
    const transactions = [
      {
        id: 'txn_1',
        type: 'Offerwall Reward',
        description: 'Lootably - Gaming Survey',
        amount: 1250,
        status: 'Completed',
        date: '2024-07-21T10:30:00Z',
      },
      {
        id: 'txn_2',
        type: 'Daily Reward',
        description: 'Daily Check-in Bonus',
        amount: 250,
        status: 'Completed',
        date: '2024-07-21T08:00:00Z',
      },
      {
        id: 'txn_3',
        type: 'Withdrawal',
        description: 'Withdraw to BTC Wallet',
        amount: -5000,
        status: 'Completed',
        date: '2024-07-20T18:45:00Z',
      },
      {
        id: 'txn_4',
        type: 'Offerwall Reward',
        description: 'AdGate - Rise of Kingdoms',
        amount: 3500,
        status: 'Completed',
        date: '2024-07-20T14:00:00Z',
      },
      {
        id: 'txn_5',
        type: 'Offerwall Reward',
        description: 'Timewall - Video Ad',
        amount: 50,
        status: 'Pending',
        date: '2024-07-20T11:15:00Z',
      },
      {
        id: 'txn_6',
        type: 'Referral Bonus',
        description: 'New user signed up with your link',
        amount: 500,
        status: 'Completed',
        date: '2024-07-19T20:00:00Z',
      },
    ];
  
    res.status(200).json(transactions);
  }
  