import { useEffect, useState } from "react";
import "@/App.css";
import { Toaster } from "sonner";
import TitleScreen from "@/components/game/TitleScreen";
import GameView from "@/components/game/GameView";
import EndingScreen from "@/components/game/EndingScreen";
import { useGameStore } from "@/game/useGameStore";
import { audioEngine } from "@/game/useAudio";

function App() {
  const { screen, ending, reset, goToScreen } = useGameStore();
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const onFirstClick = () => {
      audioEngine.init();
      setAudioReady(true);
      window.removeEventListener("pointerdown", onFirstClick);
    };
    window.addEventListener("pointerdown", onFirstClick);
    return () => window.removeEventListener("pointerdown", onFirstClick);
  }, []);

  return (
    <div className="App" data-testid="app-root">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgb(20 18 16)",
            color: "rgb(242 234 225)",
            border: "1px solid rgba(180,140,90,0.3)",
            fontFamily: "Shippori Mincho, serif",
          },
        }}
      />
      {screen === "title" && (
        <TitleScreen onStart={() => goToScreen("game")} audioReady={audioReady} />
      )}
      {screen === "game" && <GameView />}
      {screen === "ending" && (
        <EndingScreen ending={ending} onRestart={reset} />
      )}
    </div>
  );
}

export default App;
