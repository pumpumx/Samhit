
export const SocketEvents = {
    CALL_USER: 'call-user', //call this when user want's to create the initial offer and send that offer to another user
    SEND_OFFER: 'send-offer', //call this when user has to send answer to another user
    RECIEVE_CALL: 'incoming-call', //call this when user has to recieve the call
    RECEIVE_ANSWER: 'receive-answer', //Call this when user need to recieve the answer
    AVAILABLE_CANDIDIATE: 'available-candidate', //used to find the available candidate
    SEND_USER_INFO: 'send-user-info',
    DISCONNECT: 'disconnect',
    INCOMING_CALL: 'incoming-call',
    SEND_ANSWER: 'send-answer',
    USER_JOINED_ROOM: 'user-joined-room',
    CHECK_POLITE: 'check-polite',
    CHECK_POLITE_RESULT: 'check-polite-result',
    ICE_CANDIDATE: 'ice-candidate',
}