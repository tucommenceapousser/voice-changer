import { useEffect, useRef, useState } from "react";
import "./styles.css";

export default function App() {
  const [active, setActive] = useState(false);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    return () => dispose();
  }, []);

  const handleClick = () => {
    if (!active) {
      setActive(true);
      init();
    } else {
      setActive(false);
      dispose();
    }
  };

  const init = async () => {
    if (!active) {
      setActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      // processor.onaudioprocess = function(e){
      //   console.log(e.inputBuffer)
      // }

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();

      const audioChunks = [];

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log("audio url ==> ", audioUrl);
        // const arrayBuffer = await audioBlob.arrayBuffer()

        audioRef.current.src = audioUrl;
        // audioRef.current.playbackRate = 2
      });
    }
  };

  const dispose = () => {
    if (mediaRecorderRef.current && audioContextRef.current) {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        audioContextRef.current.close();
      }
    }
  };

  return (
    <div className="App">
      <button onClick={handleClick}>{`${
        active ? "Stop" : "Start"
      } recording`}</button>
      <br />
      <br />
      <br />
      <audio ref={audioRef} controls />
    </div>
  );
}
