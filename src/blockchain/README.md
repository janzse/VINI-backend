# Implementation-Guide to switch to another Blockchain (BC)

## Implement the following functions:
### async function isConnected()
Design a function which checks if your program has a connection to the BC.
This function has to return a Promise which resolves to _true_ if there exists a connection to the BC
and to false if no connection can be established.

### function sendTransaction(transaction)
Design a function which takes a transaction object as a parameter and inserts it into the BC.
This function has to return a Promise which resolves to the _transactionHash_ if the transaction was successful
and to _null_ if an error occurs.

### async function sendSignedTransaction(transaction, privateKey)
Design a function which takes a transaction object and a private key as a parameter and inserts the transaction
signed with the private key into the BC.
Whenever a transaction has been successfully inserted into the BC the transaction hash has to be entered into the
DB using the function _updateHeadTransactionHash_ of the dbHelper object with the transaction target and the
transaction hash as parameters.
This function has to return a Promise which resolves to the _transactionHash_ if the transaction was successful
and to _null_ if an error occurs.

### async function getTransaction(transHash)
Design a function which takes a hash of a transaction as a parameter.
This function has to return a Promise which resolves to a _transaction_ object if the transaction to the given
hash was found and to _null_ if no transaction with the given hash is part of the BC or an error occurs.

### async function getAllTransactions(headTxHash)
Design a function which takes a hash of a transaction as a parameter.
This function has to search a transaction to the given hash and uses the preTransaction attribute of that
transaction to find all other transactions linked to the first one.
This function has to return a Promise which resolves to an array of _transaction_ objects including all transactions
found to the given hash and to _null_ if an error occurs.

### async function createUserAccount()
Design a function which generates a public and private key-pair for a user. It is advised to store the keys in
a save place! You may discard the public key completely since it is not used for the functionality of the program,
but keep in mind that you can't restore it once tossed. An user account does not need a public key because it never
receives a transaction and only sends them. You have to keep in mind that a new user might need some funds to create
transactions afterwards.
This function has to return a Promise resolving to an object with _privateKey_ and _publicKey_ as attributes and to
_null_ if an error occurs.

### function createCarAccount()
Design a function which generates a public and private key-pair for a car. It is advised to store the keys in
a save place! You may discard the private key completely since it is not used for the functionality of the program,
but keep in mind that you can't restore it once tossed. A car account does not need any funds because it only
receives transactions from user accounts and never sends transactions.
This function has to return a Pan object with _privateKey_ and _publicKey_ as attributes and _null_ if an error occurs.

## Notes
You may also change the field gas of the transaction class and change the name to transactionFee if the BC you are
using implements fees.
The function isConnected() can be used within your functions to make sure you can safely interact with the BC.
The BC you use may also provide other ways to ensure connection to the BC.
Use the ethNode.js file as a cheat sheet while implementing another BC wrapper.