const web3 = new Web3(window.ethereum);
let contract;
let userAccount;

const contractAddress = "0xb94ca9DB29631AC698ab2c9beb30afbEA7Fc1a42";
const abi = [
    {"inputs":[{"internalType":"uint8","name":"_secretNumber","type":"uint8"}],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"newSecretNumber","type":"uint8"}],"name":"GameRestarted","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"},
     {"indexed":false,"internalType":"uint8","name":"guessedNumber","type":"uint8"},
     {"indexed":false,"internalType":"bool","name":"success","type":"bool"}],"name":"NumberGuessed","type":"event"},
    {"inputs":[],"name":"gameActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint8","name":"_number","type":"uint8"}],"name":"guess","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasGuessed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"players","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint8","name":"_newSecretNumber","type":"uint8"}],"name":"restartGame","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = (await web3.eth.getAccounts())[0];
            contract = new web3.eth.Contract(abi, contractAddress);
            document.getElementById("account").innerText = "Connected account: " + userAccount;
            document.getElementById("game").style.display = 'block'; // Show game interface after connection
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    } else {
        alert("Please install MetaMask or another Ethereum-compatible wallet.");
    }
}

async function submitGuess() {
    const guessedNumber = parseInt(document.getElementById("guessedNumber").value);
    
    if (guessedNumber < 1 || guessedNumber > 10) {
        alert("Please enter a number between 1 and 10.");
        return;
    }

    try {
        const gameActive = await contract.methods.gameActive().call();
        if (!gameActive) {
            alert("The game is not active currently.");
            return;
        }

        const hasGuessed = await contract.methods.hasGuessed(userAccount).call();
        if (hasGuessed) {
            alert("You have already made a guess.");
            return;
        }

        const gasEstimate = await contract.methods.guess(guessedNumber).estimateGas({ from: userAccount });
        console.log("Estimated gas: " + gasEstimate);

        // Perform the transaction
        const tx = await contract.methods.guess(guessedNumber).send({
            from: userAccount,
            gas: gasEstimate,
            gasPrice: web3.utils.toWei('5', 'gwei') // Set a lower gas price (minimized)
        });

        document.getElementById("guessResult").innerText = "Your guess has been sent! Please wait for the result.";
        console.log("Transaction sent: " + tx.transactionHash);
    } catch (error) {
        console.error("Error sending transaction:", error);
        document.getElementById("guessResult").innerText = "An error occurred. Please try again.";
    }
}
