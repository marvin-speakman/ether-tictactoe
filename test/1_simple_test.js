var TicTacToe = artifacts.require('TicTacToe');

contract('TicTacToe', function(accounts){
    it('empty board at start up',function(){
        return TicTacToe.new({from: accounts[0], value: web3.toWei(0.1, 'ether')}).then(function (instance ) {
            return instance.getBoard.call();
        }).then(board => {
            assert.equal(board[0][0], 0, 'first row empty');
        }).catch(err => {
            console.log(err);
        });
    });
});