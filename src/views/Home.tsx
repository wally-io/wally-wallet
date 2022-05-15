import React, {useEffect, useState} from "react"
import {fetchToken, onMessageListener} from "../firebase/firebase-client"
import {Button, Col, Row, Toast} from "react-bootstrap"
import Http from "../utils/Http"
import {useNavigate} from "react-router-dom"
import {ethers} from "ethers"

export const domain = process.env.REACT_APP_WALLY_API

function Home() {

    let navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [notification, setNotification] = useState({title: '', body: ''});
    const [isFcmOn, setFcmOn] = useState(localStorage.getItem("fcm") != null);

    useEffect(() => {
        if (localStorage.getItem("wallet-private") == null) {
            navigate("")
        }
        const privateKey = localStorage.getItem("wallet-private")!
        const address = localStorage.getItem("wallet-address")!
        Http.post(domain!, "/wallet/eth/challenge", null, {address: address}, async (response: any) => {
            const message = response.message
            let provider = ethers.getDefaultProvider('ropsten');
            const wallet = new ethers.Wallet(privateKey, provider);
            const signature = await wallet.signMessage(message);
            console.log("address: ", address)
            console.log("signature: ", signature)

            Http.post(domain!, "/wallet/login", null, {address, signature}, (response: any) => {
                localStorage.setItem("token",response.token)
            }, (error) => {
                Http.post(domain!, "/wallet/eth/register", null, {address, signature}, (response: any) => {
                    localStorage.setItem("token",response.token)
                }, (error) => {
                    console.error(error)
                })
            })
        }, (error) => {
            console.error(error)
        })
    }, [])

    onMessageListener().then((payload: any) => {
        setNotification({title: payload.notification.title, body: payload.notification.body})
        setShow(true);
        console.log(payload);
    }).catch(err => console.log('failed: ', err));

    const onShowNotificationClicked = () => {
        setNotification({title: "Notification", body: "This is a test notification"})
        setShow(true);
    }

    const onConnectFCMClicked = () => {
        fetchToken(setFcmOn);
    }


    return (
        <div className="App">
            <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide animation style={{
                position: 'absolute',
                top: 20,
                right: 20,
                minWidth: 200
            }}>
                <Toast.Header>
                    <img
                        src="holder.js/20x20?text=%20"
                        className="rounded mr-2"
                        alt=""
                    />
                    <strong className="mr-auto">{notification.title}</strong>
                    <small>just now</small>
                </Toast.Header>
                <Toast.Body>{notification.body}</Toast.Body>
            </Toast>
            <header className="App-header">
                {isFcmOn && <h1> Notification permission enabled 👍🏻 </h1>}
                {!isFcmOn && <h1> Need notification permission ❗️ </h1>}
                <Row><Col><Button onClick={() => onShowNotificationClicked()}>test Toast</Button></Col></Row>
                <Row><Col><Button onClick={() => onConnectFCMClicked()}>Connect FCM</Button></Col></Row>
            </header>

        </div>
    );
}

export default Home;