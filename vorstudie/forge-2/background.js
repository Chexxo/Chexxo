forge.options.usePureJavaScript = true;

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757'}, function() {
        console.log("The color is green.");
    });
}); 

chrome.webNavigation.onCompleted.addListener(function(details) {
    console.log(details);
    // create TLS client
    let cert;
    var client = forge.tls.createConnection({
        server: false,
        caStore: []/* Array of PEM-formatted certs or a CA store object */,
        sessionCache: {},
        // supported cipher suites in order of preference
        cipherSuites: [
            forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
            forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
        virtualHost: 'example.com',
        verify: function(connection, verified, depth, certs) {
            if(depth === 0) {
                var cn = certs[0].subject.getField('CN').value;
                cert = certs[0];
                if(cn !== 'example.com') {
                    verified = {
                        alert: forge.tls.Alert.Description.bad_certificate,
                        message: 'Certificate common name does not match hostname.'
                    };
                }
            }
            return verified;
        },
        connected: function(connection) {
            console.log('connected');
            console.log(cert);
            console.log(connection);
        },
        /* provide a client-side cert if you want
        getCertificate: function(connection, hint) {
            return myClientCertificate;
        },
        /* the private key for the client-side cert if provided */
        getPrivateKey: function(connection, cert) {
            return myClientPrivateKey;
        },
        tlsDataReady: function(connection) {
            // TLS data (encrypted) is ready to be sent to the server
            //sendToServerSomehow(connection.tlsData.getBytes());
            // if you were communicating with the server below, you'd do:
            // server.process(connection.tlsData.getBytes());
        },
        dataReady: function(connection) {
            // clear data from the server is ready
            console.log('the server sent: ' +
            forge.util.decodeUtf8(connection.data.getBytes()));
            // close connection
            connection.close();
        },
        /* NOTE: experimental
        heartbeatReceived: function(connection, payload) {
            // restart retransmission timer, look at payload
            clearInterval(myHeartbeatTimer);
            myHeartbeatTimer = setInterval(function() {
            connection.prepareHeartbeatRequest(forge.util.createBuffer('1234'));
            }, 5*60*1000);
            payload.getBytes();
        },*/
        closed: function(connection) {
            console.log('disconnected');
        },
        error: function(connection, error) {
            console.log('uh oh', error);
        }
    });
    // start the handshake process
    client.handshake();
})
