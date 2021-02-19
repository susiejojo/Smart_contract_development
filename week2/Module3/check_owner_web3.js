(async () => {
    const accounts = await web3.eth.getAccounts()
    
    const contractAddress = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B'
    console.log('Chech Owner started...')
    
    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/contracts/artifacts/Owner.json'))
    // const accounts = await web3.eth.getAccounts()
    
    let contract = new web3.eth.Contract(metadata.abi, contractAddress)
    console.log("Connected to account!")
    // console.log("Address: ",accounts[0])
    
    const result = await contract.methods.getOwner().call({from: accounts[0]})
    console.log("Current Owner_",result)
})()
