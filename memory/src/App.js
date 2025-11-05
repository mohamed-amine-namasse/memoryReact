import logo from "./logo.svg";
import "./App.css";
import Card from "./components/Card";
import Button from "./components/Button";

function App() {
  return (
    <div className="App">
      <h1>bonjour</h1>
      <Card text="Je suis une carte" />
      <Button text="Je suis un bouton" />
    </div>
  );
}

export default App;
