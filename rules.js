/* Rules reference: condensed from the Tokaido Duo Automa solo rulebook (r5), with the rulebook's images. */
window.RULES = [
  { id: 'general', title: 'General rules', html: `
    <p>You play against an artificial opponent, <b>Automa</b>, who takes the place of a human player.</p>
    <ul>
      <li>You follow the normal game rules; Automa follows the rules below.</li>
      <li>Automa is a player: she takes her place in the turn order like you do.</li>
      <li>Automa only receives what is specifically mentioned in these rules.</li>
      <li><b>All game rules not explicitly overridden here are still in effect.</b></li>
    </ul>
    <p><b>Components:</b> 9 double-sided Character cards (3 per Character: Pilgrim, Merchant, Artist). Each side shows a difficulty level.</p>` },
  { id: 'setup', title: 'Game setup', html: `
    <p>Set up as in the main rulebook, with Automa playing <b>purple</b>, and these exceptions:</p>
    <ol>
      <li>Instead of Character boards, Automa gets a set of 3 Character cards. Choose a difficulty from <b>Level 1</b> (easiest) to <b>Level 6</b> (hardest) and take those 3 cards. For your first play use <b>Level 2</b>, face up.</li>
      <li>Put 1 coin (the <b>Rank token</b>) on the “Start” space of the <b>Rank track</b> of each Character card.</li>
      <li>Put 1 coin in each of the 2 central areas and 1 purple Painting tile on the Coastal town shown in the picture. These tokens affect Automa's scoring but <u>not</u> movement for you or Automa.</li>
      <li>Place Automa's Character meeples on their starting spaces furthest from the compass.</li>
      <li>Decide at random who starts.</li>
    </ol>
    <figure><img src="img/setup-board.jpg" alt="Solo setup on the game board"><figcaption>Board setup (coins in the central areas, Painting tile on the Coastal town, Automa's meeples at the start).</figcaption></figure>` },
  { id: 'movement', title: 'Automa movement', html: `
    <p>Automa's <b>Pilgrim</b> moves around the island as usual. Her <b>Merchant</b> (dashed orange arrows) and <b>Artist</b> (thick brown arrows) instead follow a fixed <b>clockwise circular path</b>.</p>
    <p>The Merchant only visits Coastal towns and ignores the Mountain towns. Otherwise Automa's Characters interact with other Characters like yours do — e.g. the Merchant does not move if its destination is occupied by another Character.</p>
    <figure><img src="img/movement-map.jpg" alt="Circular paths of the Merchant and Artist"><figcaption>Merchant path (dashed orange) and Artist path (thick brown).</figcaption></figure>` },
  { id: 'ranks', title: 'Character ranks', html: `
    <p>Each Rank token moves along its track space by space. It advances <b>1 space</b> when the matching Character lands on:</p>
    <ul>
      <li><b>Artist</b> – an area without a coin.</li>
      <li><b>Merchant</b> – a Coastal town without a Painting tile.</li>
      <li><b>Pilgrim</b> – a Garden, a Temple, or a Coastal town without a Painting tile.</li>
    </ul>
    <figure><img src="img/rank-track.jpg" alt="Rank track example"><figcaption>A Rank token moving along its track.</figcaption></figure>
    <p>When Automa gains a Wave tile it is placed on that Character's Rank track to boost her advances. If a Rank token moves onto a space holding a Wave tile, it advances <b>1 additional space</b>, then the Wave tile is removed and placed again.</p>
    <p>The <b>Rank</b> of a Character (and its die) is the first visible number after the Rank token, skipping spaces that hold a Wave tile.</p>
    <figure><img src="img/rank-visible.jpg" alt="Rank is the first visible number after the token"><figcaption>Left: Rank 14. Right: with a Wave tile on 14, the Rank is 17.</figcaption></figure>
    <p><b>End of the game:</b> besides the usual triggers, the game also ends when any Rank token reaches the final space of its track. The number at the very end (no circle) is <u>not</u> a space.</p>
    <figure><img src="img/end-of-game.jpg" alt="Final space"><figcaption>Reaching the last circle triggers the end.</figcaption></figure>` },
  { id: 'waves', title: 'Wave tiles', html: `
    <p>Like you, Automa gains a Wave tile when her Pilgrim lands on a Seashore:</p>
    <ol>
      <li>If any Wave tiles remain on the game board, only those are valid. Otherwise <i>your</i> tiles are valid.</li>
      <li>Among the valid tiles, Automa takes the tile whose Character has the <b>highest Rank</b> (tiebreaker: Pilgrim &gt; Merchant &gt; Artist) and places it on that Character card.</li>
    </ol>
    <p><b>Placing a Wave tile:</b> put it on the first space after the Rank token that has a Wave icon. If there is no such space, put it anywhere on the card outside the track.</p>
    <figure><img src="img/wave-placing.jpg" alt="Placing Wave tiles"><figcaption>Left: placing a tile after gaining it. Right: placing it again after the token advanced over it.</figcaption></figure>` },
  { id: 'turns', title: 'Automa turns', html: `
    <p>After rolling the 3 dice, arrange them in a column by how close they are to the opposite side of the table (closest on top). If unsure which of two is closer, put the rightmost one above. This order is used as a tiebreaker.</p>
    <p>On her turn, Automa does the first that applies:</p>
    <ol>
      <li><b>Seashore:</b> if the Pilgrim die would move the Pilgrim to a Seashore and Automa doesn't yet have all 3 Wave tiles: give her the Pilgrim die, move the Pilgrim, then follow the Wave tile procedure.</li>
      <li><b>Advance:</b> otherwise go through the available dice by decreasing Rank (tiebreaker: die highest in the column) until one would move a Character onto a space that makes a Rank track advance. Give her that die, move the Character, and advance once on that Character's track.</li>
      <li><b>Fallback:</b> if neither gave her a die, give her the available die with the highest Rank (tiebreaker: highest in the column) and move that Character, if possible.</li>
    </ol>` },
  { id: 'scoring', title: 'Scoring & variant', html: `
    <p>Automa scores victory points equal to the <b>sum of her 3 Character Ranks</b>.</p>
    <p>If you tie, money is the tiebreaker as usual — Automa has no money.</p>
    <p><b>Character priority variant:</b> mix Character cards from different difficulty levels to tweak Automa's priorities (this also changes difficulty).</p>
    <p class="small">Rules by Morten Monrad Pedersen with Lines J. Hutter and David Studley. Tokaido Duo by Antoine Bauza &amp; Naïade, published by Stonemaier Games. This offline reference is a personal-use summary of the Automa rulebook.</p>` },
];
