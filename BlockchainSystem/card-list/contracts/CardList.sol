pragma solidity ^0.5.0;

contract CardList {
   uint public cardCount = 0;

   struct Card {
    uint id;
    string name;
    string num;
    string code;
    string exdate;
  }

  mapping(uint => Card) public cards;

     constructor() public {
      createCard("Andrea", "0801200000240", "504", "12/20");
   }
   
  function createCard(string memory _name, string memory _num, string memory _code, string memory _exdate) public {
    cardCount ++;
    cards[cardCount] = Card(cardCount, _name, _num, _code, _exdate);
  }

}