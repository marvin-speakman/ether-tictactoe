// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
import $ from 'jQuery';

// Import our contract artifacts and turn them into usable abstractions.
import ticTacToe_artifacts from '../../build/contracts/TicTacToe.json'

// TicTacToe is our usable abstraction, which we'll use through the code below.
const TicTacToe = contract(ticTacToe_artifacts)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account
let ticTacToeInstance

window.App = {
  start: function () {
    const self = this

    // Bootstrap the TicTacToe abstraction for Use.
    TicTacToe.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs;
      account = accounts[0];

    })
  },

  useAccountOne: function(){
    account = accounts[1];
  },


  createNewGame: function(){
    TicTacToe.new({from:account, value:web3.toWei(0.1,'ether'), gas:3000000}).then(instance =>{
      ticTacToeInstance = instance;

      var playerJoindEvent = ticTacToeInstance.PlayerJoined();

      playerJoindEvent.watch(function (error, eventObj) {
        if(!error){
          console.log(eventObj);
        }else{
          console.log(error);
        }
      });
      
      var nextPlayerEvent = ticTacToeInstance.NextPlayer();
      nextPlayerEvent.watch(App.nextPlayer);

      var gameOverWithWinEvent = ticTacToeInstance.GameOverWithWin();
      gameOverWithWinEvent.watch(App.gameOver);

      var gameOverWithDrawEvent = ticTacToeInstance.GameOverWithDraw();
      gameOverWithDrawEvent.watch(App.gameOver);
      
      console.log(instance);
    }).catch(error => {
      console.log(error);
    });
  },

  joinGame: function(){
    var gameAddress = prompt('address of the game');
    if(gameAddress != null){
      TicTacToe.at(gameAddress).then(instance => {
        ticTacToeInstance = instance;

        var nextPlayerEvent = ticTacToeInstance.NextPlayer();
        nextPlayerEvent.watch(App.nextPlayer);

        var gameOverWithWinEvent = ticTacToeInstance.GameOverWithWin();
        gameOverWithWinEvent.watch(App.gameOver);

        var gameOverWithDrawEvent = ticTacToeInstance.GameOverWithDraw();
        gameOverWithDrawEvent.watch(App.gameOver);

        return ticTacToeInstance.joinGame({from:account, value:web3.toWei(0.1, 'ether'), gass:3000000});
      }).then(txResult => {
        
        console.log(txResult);
      })
    }
  },
  nextPlayer: function (error, eventObj) {
    App.printBoard();
    if(eventObj.args.player == account){
      //our turn
      // on click for board
      for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
          if($("#board")[0].children[0].children[i].children[j].innerHTML === "") {
            $($("#board")[0].children[0].children[i].children[j]).off('click').click({x: i, y:j}, App.setStone);
          }
        }
      }
    } else{
      //oponents turn
    }
  },
  gameOver: function(err, eventObj) {
    console.log("Game Over", eventObj);
    if(eventObj.event == "GameOverWithWin") {
      if(eventObj.args.winner == account) {
        alert("Congratulations, You Won!");
      } else {
        alert("Woops, you lost! Try again...");
      }
    } else {
      alert("That's a draw, oh my... next time you do beat'em!");
    }


    // nextPlayerEvent.stopWatching();
    // gameOverWithWinEvent.stopWatching();
    // gameOverWithDrawEvent.stopWatching();

    for(var i = 0; i < 3; i++) {
      for(var j = 0; j < 3; j++) {
            $("#board")[0].children[0].children[i].children[j].innerHTML = "";
      }
    }

      // $(".in-game").hide();
      // $(".game-start").show();
  },
  setStone: function(event){
    console.log(event);

    for(var i = 0; i < 3; i++){
      for(var j = 0; j < 3; j++){
        $($('#board')[0].children[0].children[i].children[j]).prop('onclick', null).off('click');
      }
    }

    ticTacToeInstance.setStone(event.data.x, event.data.y, {from: account}).then(txResult => {
      console.log(txResult);
      App.printBoard();
    });
  },
  printBoard: function(){
    ticTacToeInstance.getBoard.call().then(board => {
      for(var i = 0; i < board.length; i++) {
        for(var j = 0; j < board[i].length; j++) {
          if(board[i][j] == account){
            $('#board')[0].children[0].children[i].children[j].innerHTML = 'X';
          } else if(board[i][j] != 0){
            $('#board')[0].children[0].children[i].children[j].innerHTML = 'O';
          }
        }
      }
    })
  }

};


window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 TicTacToe,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }

  App.start();
})
