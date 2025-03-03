import { HashRouter, Route, Routes } from "react-router";
import { ConstructionsPage } from "./routes/Constructions";
import { Header } from "./routes/Header";
import { Home } from "./routes/Home";
import { InteractiveExplanations } from "./routes/InteractiveExplanations";
import { LabelCorrectionPage } from "./routes/Labels";

export const App = () => {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Header />}>
            <Route index element={<Home />} />
            <Route path="/vegalite-labels" element={<LabelCorrectionPage />} />
            <Route path="/explanations" element={<InteractiveExplanations />} />
            <Route path="/constructions" element={<ConstructionsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </>
  );
};
export default App;
