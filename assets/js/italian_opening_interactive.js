$(document).ready(function () {
  // --- Data for all Chess Variations ---
  const variationsData = {
    "basic-setup": {
      name: "Italian Opening: Basic Setup",
      pgn: "1.e4 e5 2.Nf3 Nc6 3.Bc4",
      annotations: [
        {
          move: 1,
          san: "e4",
          text: "White starts with 1.e4, the King's Pawn Opening, immediately fighting for central control and opening lines for the queen and king's bishop. This is the most popular first move in chess.",
        },
        {
          move: 1,
          san: "e5",
          text: "Black responds symmetrically with 1...e5, also staking a claim in the center and preparing to develop pieces. This leads to open and tactical games.",
        },
        {
          move: 2,
          san: "Nf3",
          text: "White develops the kingside knight, attacking Black's e5 pawn and preparing to castle. This is the most common and flexible developing move.",
        },
        {
          move: 2,
          san: "Nc6",
          text: "Black develops the queenside knight, defending the e5 pawn and controlling the d4 square. This is a natural and solid response.",
        },
        {
          move: 3,
          san: "Bc4",
          text: "This is the Italian Opening. The bishop on c4 puts pressure on Black's weakest point, the f7 pawn, which is only defended by the king. It also controls key central squares and prepares for kingside castling.",
          highlights: { squares: ["f7"], color: "red" },
        },
      ],
    },
    "giuoco-piano": {
      name: "Giuoco Piano: Main Line",
      pgn: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb6",
      annotations: [
        {
          move: 3,
          san: "Bc5",
          text: "Black develops their own bishop to c5, creating a symmetrical position. This is the start of the Giuoco Piano, or 'Quiet Game'.",
          highlights: { squares: ["f2"], color: "yellow" },
        },
        {
          move: 4,
          san: "c3",
          text: "White prepares the central pawn push d4. This is a key strategic idea in the Italian, aiming to seize control of the center.",
          highlights: { squares: ["d4"], color: "green" },
        },
        {
          move: 4,
          san: "Nf6",
          text: "Black develops the other knight and puts counter-pressure on White's e4 pawn.",
        },
        {
          move: 5,
          san: "d4",
          text: "White executes the d4 pawn break, challenging Black in the center and opening lines.",
        },
        {
          move: 5,
          san: "exd4",
          text: "Black is forced to capture, otherwise White gets a massive pawn center.",
        },
        {
          move: 6,
          san: "cxd4",
          text: "White recaptures, maintaining a strong central presence.",
        },
        {
          move: 6,
          san: "Bb6",
          text: "A solid retreat. Black keeps the bishop active and prepares to challenge White's center.",
        },
      ],
    },
    "giuoco-pianissimo": {
      name: "Giuoco Pianissimo: Positional Play",
      pgn: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.d3 Nf6 5.O-O d6 6.c3 a6",
      annotations: [
        {
          move: 4,
          san: "d3",
          text: "Instead of the aggressive c3 and d4, White plays the quiet d3. This leads to the Giuoco Pianissimo or 'Very Quiet Game'. The focus is on slow, strategic maneuvering.",
        },
        { move: 4, san: "Nf6", text: "Black develops naturally." },
        { move: 5, san: "O-O", text: "White castles, securing the king." },
        {
          move: 5,
          san: "d6",
          text: "Black solidifies the center and prepares to develop the light-squared bishop.",
        },
        {
          move: 6,
          san: "c3",
          text: "White prepares d4 for the future and creates a retreat square for the bishop on c2.",
        },
        {
          move: 6,
          san: "a6",
          text: "A key move. Black prevents White's b4 push and prepares to develop the bishop via a7.",
        },
      ],
    },
    "evans-gambit": {
      name: "Evans Gambit: Sharp Play",
      pgn: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4",
      annotations: [
        {
          move: 4,
          san: "b4",
          text: "The Evans Gambit! White offers a pawn to deflect Black's c5 bishop, aiming to build a powerful center with c3 and d4 and accelerate development.",
          highlights: { squares: ["b4"], color: "green" },
        },
        {
          move: 4,
          san: "Bxb4",
          text: "Evans Gambit Accepted. Black takes the pawn, but this allows White to gain time.",
        },
        {
          move: 5,
          san: "c3",
          text: "White attacks the bishop and prepares d4.",
        },
        {
          move: 5,
          san: "Ba5",
          text: "The most common retreat, keeping the bishop active and pinning the c3 pawn.",
        },
        {
          move: 6,
          san: "d4",
          text: "White seizes the center. This is the compensation for the gambit pawn: a strong center and rapid development.",
        },
      ],
    },
    "fried-liver": {
      name: "Fried Liver Attack",
      pgn: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 6.Nxf7 Kxf7 7.Qf3+",
      annotations: [
        {
          move: 4,
          san: "Nf6",
          text: "The Two Knights Defense. Black develops and counter-attacks e4.",
        },
        {
          move: 4,
          san: "Ng5",
          text: "A very aggressive move. White breaks the opening principle 'don't move the same piece twice' to attack the f7 pawn with both the knight and bishop.",
          highlights: { squares: ["f7"], color: "red" },
        },
        {
          move: 5,
          san: "d5",
          text: "The correct response. Black blocks the bishop's attack on f7 and attacks White's bishop.",
        },
        { move: 5, san: "exd5", text: "White captures the pawn." },
        {
          move: 5,
          san: "Nxd5",
          text: "A common mistake by beginners, though it can lead to complex play. The main line is 5...Na5. This move allows the Fried Liver Attack.",
        },
        {
          move: 6,
          san: "Nxf7",
          text: "The Fried Liver Attack! White sacrifices the knight on f7 to expose the black king. This is a powerful attack.",
          highlights: { squares: ["f7", "e6"], color: "red" },
        },
        {
          move: 6,
          san: "Kxf7",
          text: "Black must recapture. The king is now dangerously exposed in the center of the board.",
        },
        {
          move: 7,
          san: "Qf3+",
          text: "White continues the attack with a check, forcing the king to move and preventing Black from organizing a defense.",
        },
      ],
    },
    "traxler-counterattack": {
      name: "Traxler Counterattack",
      pgn: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 Bc5 5.Nxf7 Bxf2+",
      annotations: [
        { move: 4, san: "Ng5", text: "White attacks f7." },
        {
          move: 4,
          san: "Bc5",
          text: "The Traxler Counterattack! Instead of defending f7, Black launches a shocking counterattack against White's f2 square. This leads to incredibly sharp and dangerous positions for both sides.",
          highlights: { squares: ["f2"], color: "red" },
        },
        {
          move: 5,
          san: "Nxf7",
          text: "One of White's main options is to capture on f7. Now both kings are in danger.",
        },
        {
          move: 5,
          san: "Bxf2+",
          text: "Black springs the trap, sacrificing the bishop to expose the white king. A tactical melee ensues.",
        },
      ],
    },
  };

  let currentBoardId = null;
  let boards = {}; // Store instances of boards

  function clearHighlights(boardId) {
    $(`#${boardId} .square-55d63`).removeClass(
      "highlight-red highlight-yellow highlight-green highlight-blue"
    );
  }

  function highlightSquares(boardId, highlights) {
    clearHighlights(boardId);
    if (highlights && highlights.squares) {
      highlights.squares.forEach((sq) => {
        $(`#${boardId} .square-${sq}`).addClass(
          `highlight-${highlights.color}`
        );
      });
    }
  }

  function updateUI(boardId) {
    const boardState = boards[boardId];
    if (!boardState) return;

    const history = boardState.game.history({ verbose: true });
    const currentMove = history[boardState.currentMoveIndex];

    let annotation = "";
    let highlights = null;

    if (boardState.currentMoveIndex < 0) {
      annotation = "Start of the game.";
    } else {
      const moveNumber = Math.floor(boardState.currentMoveIndex / 2) + 1;
      const san = currentMove.san;

      const matchingAnnotation = boardState.variation.annotations.find((a) => {
        // Adjust for PGN where move number can be ambiguous for black
        const pgnMoveNumber = a.move;
        return pgnMoveNumber === moveNumber && a.san === san;
      });

      if (matchingAnnotation) {
        annotation = matchingAnnotation.text;
        highlights = matchingAnnotation.highlights;
      } else {
        // Fallback for opening moves not in annotations array
        const baseAnnotations = variationsData["basic-setup"].annotations;
        const baseAnnotation = baseAnnotations.find(
          (a) => a.move === moveNumber && a.san === san
        );
        if (baseAnnotation) annotation = baseAnnotation.text;
      }
    }

    // Update annotation
    let moveText = currentMove
      ? `${Math.floor(boardState.currentMoveIndex / 2) + 1}${
          currentMove.color === "w" ? "." : "..."
        } ${currentMove.san}`
      : "Start";
    $(`#${boardId}-annotation-text`).html(
      `<h4>Move: ${moveText}</h4>
            <p>${annotation}</p>`
    );

    // Update board position
    const tempGame = new Chess();
    const moves = boardState.game
      .history()
      .slice(0, boardState.currentMoveIndex + 1);
    moves.forEach((move) => tempGame.move(move));
    boardState.board.position(tempGame.fen());

    highlightSquares(boardId, highlights);

    // Update info
    $(`#${boardId}-move-counter`).text(
      `Move: ${boardState.currentMoveIndex + 1} / ${history.length}`
    );

    // Update buttons
    $(`#${boardId}-prev-btn`).prop("disabled", boardState.currentMoveIndex < 0);
    $(`#${boardId}-next-btn`).prop(
      "disabled",
      boardState.currentMoveIndex >= history.length - 1
    );
  }

  function createBoard(variationId) {
    const variation = variationsData[variationId];
    const boardId = `${variationId}-board`;

    if ($(`#${boardId}`).length === 0) {
      console.error(`Container for board #${boardId} not found!`);
      return;
    }

    const game = new Chess();
    game.load_pgn(variation.pgn);

    const board = Chessboard(boardId, {
      position: "start",
      draggable: false,
      pieceTheme:
        "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
    });

    boards[boardId] = {
      board: board,
      variation: variation,
      game: game,
      currentMoveIndex: -1,
      autoplayTimer: null,
    };

    // Force resize right after creation (fixes unresponsive issue)
    setTimeout(() => {
      if (
        boards[boardId].board &&
        typeof boards[boardId].board.resize === "function"
      ) {
        boards[boardId].board.resize();
      }
    }, 200);

    // Event Listeners
    $(`#${boardId}-next-btn`).on("click", () => move(boardId, 1));
    $(`#${boardId}-prev-btn`).on("click", () => move(boardId, -1));
    $(`#${boardId}-reset-btn`).on("click", () => {
      stopAutoplay(boardId);
      boards[boardId].currentMoveIndex = -1;
      updateUI(boardId);
    });
    $(`#${boardId}-autoplay-btn`).on("click", function () {
      const icon = $(this).find("i");
      if (icon.hasClass("fa-play")) {
        startAutoplay(boardId);
        icon.removeClass("fa-play").addClass("fa-pause");
      } else {
        stopAutoplay(boardId);
        icon.removeClass("fa-pause").addClass("fa-play");
      }
    });

    updateUI(boardId);
    return boardId;
  }

  // On window load, resize all boards (in case any already created)
  $(window).on("load resize", function () {
    Object.values(boards).forEach((bs) => {
      if (bs.board && typeof bs.board.resize === "function") {
        bs.board.resize();
      }
    });
  });

  function move(boardId, direction) {
    stopAutoplay(boardId);
    const boardState = boards[boardId];
    const newIndex = boardState.currentMoveIndex + direction;
    const history = boardState.game.history();

    if (newIndex >= -1 && newIndex < history.length) {
      boardState.currentMoveIndex = newIndex;
      updateUI(boardId);
    }
  }

  function startAutoplay(boardId) {
    stopAutoplay(boardId);
    const boardState = boards[boardId];
    const history = boardState.game.history();

    if (boardState.currentMoveIndex >= history.length - 1) {
      boardState.currentMoveIndex = -1;
      updateUI(boardId);
    }

    boardState.autoplayTimer = setInterval(() => {
      if (boardState.currentMoveIndex < history.length - 1) {
        boardState.currentMoveIndex++;
        updateUI(boardId);
      } else {
        stopAutoplay(boardId);
      }
    }, 2000);
  }

  function stopAutoplay(boardId) {
    const boardState = boards[boardId];
    if (boardState && boardState.autoplayTimer) {
      clearInterval(boardState.autoplayTimer);
      boardState.autoplayTimer = null;
      $(`#${boardId}-autoplay-btn`)
        .find("i")
        .removeClass("fa-pause")
        .addClass("fa-play");
    }
  }

  $("#variation-dropdown")
    .on("change", function () {
      const selectedVariationId = $(this).val();

      $(".board-wrapper").hide();

      if (currentBoardId && boards[currentBoardId]) {
        stopAutoplay(currentBoardId);
      }

      const newBoardContainer = $(`#${selectedVariationId}-board-wrapper`);
      const boardId = `${selectedVariationId}-board`;

      if (!boards[boardId]) {
        currentBoardId = createBoard(selectedVariationId);
      } else {
        currentBoardId = boardId;
      }

      newBoardContainer.show();
      if (boards[currentBoardId]) {
        boards[currentBoardId].board.resize();
      }
    })
    .trigger("change");

  function createMiniBoard(id, fen) {
    Chessboard(id, {
      position: fen,
      showNotation: false,
      pieceTheme:
        "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
    });
  }

  const tacticsFENs = {
    "tactic-board-1":
      "r1b1k2r/pppp1Npp/2n5/2b5/2B1P3/8/PPPP1PPP/RNBQ1RK1 b kq - 0 6",
    "tactic-board-2":
      "r1b1k2r/ppp2Npp/2n5/3np3/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 7",
    "tactic-board-3":
      "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 2 5",
    "tactic-board-4":
      "r1bqk2r/ppp2kpp/2n5/2bnp3/2B5/5Q2/PPPP1PPP/RNB1K2R b KQ - 1 7",
  };

  if ($("#tactic-board-1").length) {
    for (const id in tacticsFENs) {
      createMiniBoard(id, tacticsFENs[id]);
    }
  }

  $(".faq-question").on("click", function () {
    $(this).toggleClass("active");
    const answer = $(this).next(".faq-answer");
    if (answer.css("max-height") === "0px" || !answer.css("max-height")) {
      answer.css("max-height", answer.prop("scrollHeight") + "px");
    } else {
      answer.css("max-height", "0");
    }
  });
});
