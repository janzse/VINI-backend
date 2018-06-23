# Implementation-Guide for switching to another Blockchain (BC)

## Implement the following functions:
### async function isConnected()
Design a function which check if your program got a connection to the BC.
This function should return true when your program got a connection to the BC.
This function should return false when your program got no connection the BC.

### function sendTransaction(transaction)
Design a function which takes a transaction object as a parameter and sends it to the BC.
This function should return a Promise which is null when the transaction was not send to the BC.

### async function sendSignedTransaction(transaction, privateKey)
Design a function which takes a transaction object and an private key as a parameter.
The private key should be used to sign the transaction object.
This function should return a Promise which is null when the transaction could not be signed with the private key.

### async function getTransaction(transHash)
Design a function which takes a hash of a transaction as a parameter.
This function should search the BC with the hash and return a transaction object if it was found.
This function should return null of the transaction with the given hash is no part of the BC.

### async function getAllTransactions(headTxHash)
Design a function which takes a hash of a transaction as a parameter.
This function should search the BC with the hash and use the preTransaction field of the first found transaction to traverse to the next transaction in order.
While traversing the BC store all found transactions as a transaction object in an array.
This function should return the array of transactions objects.
This function should return null if there was an error while searching or when there are not transactions.

### async function createUserAccount()
Design a function which generates a public and private key for a user. It is advised to the the keys in a save place!
You may discard the public key completely since it is not used for the functionality of the program.
A user account does not need a public key because a user never receives a transaction and only sends them.
It is also advised to make an transaction with some currency to this new account so that the account is pre-funded and can create transactions.
This function should return a javascript object with the private key and public key.
This function should return null if there was an error while creating the keys and pre-funding it.

### function createCarAccount()
Design a function which generates a public and private key for a user. It is advised to the the keys in a save place!
You may discard the private key completely since it is not used for the functionality of the program.
A car account does not need pre-funding because it only receives transactions from user accounts this is also the reason why the car does not need a private key.
This function should return a javascript object with the private key and public key.
This function should return null if there was an error while creating the keys.

## Notes
You may also change the field gas of the transaction class and change the name to transactionFee if the BC you are using does have fees.
The function isConnected() can be used within your function to make sure you can safely interact with the BC.
The BC you use may also provide other ways to ensure connection to the BC.
Use the ethNode.js file as a cheat sheet while implementing another BC.