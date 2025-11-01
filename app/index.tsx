import { Audio } from "expo-av";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Snackbar } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Icons from "../components/Icons";

export default function Index() {
  const [isCross, setIsCross] = useState<boolean>(false);
  const [gameWinner, setGameWinner] = useState<string>("");
  const [gameState, setGameState] = useState(new Array(9).fill("empty", 0, 9));
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const [visible, setVisible] = useState(false);
  const [snackText, setSnackText] = useState("");

  const playSound = async (type: "win" | "draw") => {
    let soundFile: any;

    if (type === "win") soundFile = require("../assets/win.mp3");
    else if (type === "draw") soundFile = require("../assets/draw.mp3");

    if (!soundFile) return;

    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  };
  // Snackbar handler
  const showSnack = (text: string) => {
    setSnackText(text);
    setVisible(true);
  };

  const reloadGame = () => {
    setIsCross(false);
    setGameWinner("");
    setGameState(new Array(9).fill("empty", 0, 9));
    setWinningLine([]);
  };

  // 🎯 Shake animation for draw
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));
  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  // ✨ Fade-in animation for winner message
  const fadeIn = useSharedValue(0);
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const triggerFadeIn = () => {
    fadeIn.value = 0;
    fadeIn.value = withTiming(1, { duration: 800 });
  };

  const checkIsWinner = (currentState: string[]) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let [a, b, c] of winningCombinations) {
      if (
        currentState[a] !== "empty" &&
        currentState[a] === currentState[b] &&
        currentState[b] === currentState[c]
      ) {
        setGameWinner(`${currentState[a]} won the game! 🥳`);
        setWinningLine([a, b, c]);
        playSound("win");
        triggerFadeIn();
        return;
      }
    }

    // Draw condition (only once)
    if (!currentState.includes("empty") && !gameWinner) {
      setGameWinner("Game drawn... ⌛️");
      playSound("draw");
      triggerShake();
      triggerFadeIn();
    }
  };

  const onChangeItem = (itemNumber: number) => {
    if (gameWinner) {
      return showSnack(gameWinner);
    }

    if (gameState[itemNumber] === "empty") {
      const newGameState = [...gameState];
      newGameState[itemNumber] = isCross ? "cross" : "circle";
      setGameState(newGameState);
      setIsCross(!isCross);
      checkIsWinner(newGameState);
    } else {
      return showSnack("Position is already filled");
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.normal}>
        <Text style={styles.heading}>Tic-Tac-Toe Game</Text>
        <StatusBar />

        {gameWinner ? (
          <Animated.View
            style={[styles.playerInfo, styles.winnerInfo, fadeInStyle]}
          >
            <Text style={styles.winnerTxt}>{gameWinner}</Text>
          </Animated.View>
        ) : (
          <View
            style={[
              styles.playerInfo,
              isCross ? styles.playerX : styles.playerO,
            ]}
          >
            <Text style={styles.gameTurnTxt}>
              Player {isCross ? "X" : "O"}'s Turn
            </Text>
          </View>
        )}

        <Animated.View style={[shakeStyle]}>
          <FlatList
            numColumns={3}
            data={gameState}
            style={styles.grid}
            renderItem={({ item, index }) => {
              const isWinningCell = winningLine.includes(index);
              return (
                <Pressable
                  key={index}
                  style={[
                    styles.card,
                    isWinningCell ? styles.winningCell : null,
                  ]}
                  onPress={() => onChangeItem(index)}
                >
                  <Icons name={item} />
                </Pressable>
              );
            }}
          />
        </Animated.View>

        <Pressable style={styles.gameBtn} onPress={reloadGame}>
          <Text style={styles.gameBtnText}>
            {gameWinner ? "Start new game" : "Reload the game"}
          </Text>
        </Pressable>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={2000}
          style={{ backgroundColor: "#333" }}
        >
          {snackText}
        </Snackbar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    marginLeft: 80,
    marginBottom: 30,
    fontWeight: "bold",
  },
  background: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f3daedff",
  },
  normal: {
    marginTop: 100,
  },
  playerInfo: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 8,
    marginVertical: 12,
    marginHorizontal: 14,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  gameTurnTxt: {
    fontSize: 20,
    color: "#ffffffff",
    fontWeight: "600",
  },
  playerX: {
    backgroundColor: "#38CC77",
  },
  playerO: {
    backgroundColor: "#FFBC4C",
  },
  grid: {
    margin: 12,
  },
  card: {
    height: 100,
    width: "33.33%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  winningCell: {
    backgroundColor: "#b6e3c6",
  },
  winnerInfo: {
    borderRadius: 8,
    backgroundColor: "#38CC77",
    shadowOpacity: 0.1,
  },
  winnerTxt: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  gameBtn: {
    marginTop: 10,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 36,
    backgroundColor: "#8D3DAF",
  },
  gameBtnText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
