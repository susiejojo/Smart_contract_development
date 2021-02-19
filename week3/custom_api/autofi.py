import requests
import schedule
import sys
import json
import time

min_period_balance = 0
def tracker(min_balance=min_period_balance):
    print ("Running balance tracker")
    if (min_balance==0):
        min_balance = min_period_balance
    bal_res1 = requests.get("http://localhost:3000/wallet-balance/eth/")
    prev_bal = float(bal_res1.text)
    if (float(prev_bal)<min_balance):
        print ("Offset by: "+str(min_balance-prev_bal)+" ETH")
        rate_res = requests.get("http://localhost:3000/rates/1")
        print (rate_res.text)
        rate = float(rate_res.text.split(" ")[-2])
        # print (rate)
        
        # gas_res = requests.get("http://localhost:3000/gas_est")
        # gas_units = float(gas_res.text)
        # print (gas_units)
        redeem_eth = min_balance-prev_bal+0.05
        redeem_ceth = 1/rate*redeem_eth

        print ("cETH to be redeemed: "+str(redeem_ceth)+" cETH")
        bal_res3 = requests.get("http://localhost:3000/wallet-balance/ceth/")
        new_cbal = float(bal_res3.text)
        cf = input("Press Y to redeem, N to cancel: ")
        if (cf=="Y" or cf=="y"):
            if (new_cbal>redeem_ceth):
                redeem_res = requests.get("http://localhost:3000/redeem/eth/"+str(round(redeem_ceth,5)))
                print (redeem_res.text)
                if (redeem_res.text=="OK"):
                    print ("Successfully redeemed cETH")
                    bal_res = requests.get("http://localhost:3000/wallet-balance/eth/")
                    new_bal = bal_res.text
                    print ("Your wallet now has a balance of: ",new_bal," ETH")
                else:
                    print ("Redeem unsuccessful!:(")
            else:
                print ("Insufficient cETH balance!")
    else:
        print ("Balance maintained, sleeping...")


comm = sys.argv[1]
if (comm=="supply"):
    sup_amt = sys.argv[2]
    bal_res1 = requests.get("http://localhost:3000/wallet-balance/eth/")
    prev_bal = bal_res1.text
    print ("Your wallet had a previous balance of: ",prev_bal," ETH")
    sup_str = "http://localhost:3000/supply/eth/"+str(sup_amt)
    sup_res = requests.get(sup_str)
    if (sup_res.text=="OK"):
        print ("Successfully supplied to Compound!")
    bal_res2 = requests.get("http://localhost:3000/wallet-balance/eth/")
    new_bal = bal_res2.text
    print ("Your wallet now has a balance of: ",new_bal," ETH")
    bal_res3 = requests.get("http://localhost:3000/wallet-balance/ceth/")
    new_cbal = bal_res3.text
    print ("cEth balance of: ",new_cbal," cETH")


elif (comm=="redeem"):
    redeem_amt = sys.argv[2]
    rate_res = requests.get("http://localhost:3000/rates/"+str(redeem_amt))
    print (rate_res.text)
    cf = input("Press Y to redeem, N to cancel: ")
    if (cf=="Y" or cf=="y"):
        redeem_res = requests.get("http://localhost:3000/redeem/eth/"+str(redeem_amt))
        if (redeem_res.text=="OK"):
            print ("Successfully redeemed cETH")
            bal_res = requests.get("http://localhost:3000/wallet-balance/eth/")
            new_bal = bal_res.text
            print ("Your wallet now has a balance of: ",new_bal," ETH")

elif (comm=="track_ot"):
    min_balance = float(sys.argv[2])
    tracker(min_balance)
    

elif (comm=="track_period"):
    min_period_balance = float(sys.argv[2])
    print ("Scheduling auto-balance...")
    schedule.every(15).seconds.do(tracker)

    while True:
        schedule.run_pending()
        time.sleep(1)










