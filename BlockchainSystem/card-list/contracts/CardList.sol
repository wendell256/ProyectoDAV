pragma solidity ^0.5.16;

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
      createCard("Wendell", "080119000240", "234", "12/20");
      createCard("Jose", "0801201000240", "765", "12/20");
   }
   
  function createCard(string memory _name, string memory _num, string memory _code, string memory _exdate) public {
    cardCount ++;
    cards[cardCount] = Card(cardCount, _name, _num, _code, _exdate);
  }

}