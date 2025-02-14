import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ConstructionsPage } from "./routes/Constructions";
import { Header } from "./routes/Header";
import { Home } from "./routes/Home";
import { InteractiveExplanations } from "./routes/InteractiveExplanations";
import { LabelCorrectionPage } from "./routes/Labels";

export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="bloom-examples" />} />
          <Route path="bloom-examples" element={<Header />}>
            <Route index element={<Home />} />
            <Route path="vegalite-labels" element={<LabelCorrectionPage />} />
            <Route path="explanations" element={<InteractiveExplanations />} />
            <Route path="constructions" element={<ConstructionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
export default App;
