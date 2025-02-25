import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { multiaddr } from '@multiformats/multiaddr'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from 'libp2p/circuit-relay'
import { identifyService } from 'libp2p/identify'

async function main () {
  const relayAddr = process.argv[2]
  if (!relayAddr) {
    throw new Error('the relay address needs to be specified as a parameter')
  }

  const node = await createLibp2p({
    transports: [
      webSockets(),
      circuitRelayTransport({
        discoverRelays: 2
      })
    ],
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      yamux(),
      mplex()
    ],
    services: {
      identify: identifyService()
    }
  })

  console.log(`Node started with id ${node.peerId.toString()}`)

  const conn = await node.dial(multiaddr(relayAddr))

  console.log(`Connected to the HOP relay ${conn.remotePeer.toString()}`)

  // Wait for connection and relay to be bind for the example purpose
  node.addEventListener('self:peer:update', (evt) => {
    // Updated self multiaddrs?
    console.log(`Advertising with a relay address of ${node.getMultiaddrs()[0].toString()}`)
  })
}

main()
