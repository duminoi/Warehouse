import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ReceiptListPage from "./pages/ReceiptListPage";
import CreateReceiptPage from "./pages/CreateReceiptPage";
import ReceiptDetailPage from "./pages/ReceiptDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ReceiptListPage />} />
          <Route path="/create" element={<CreateReceiptPage />} />
          <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
