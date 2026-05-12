import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ReceiptListPage from "./pages/ReceiptListPage";
import CreateReceiptPage from "./pages/CreateReceiptPage";
import ReceiptDetailPage from "./pages/ReceiptDetailPage";
import EditReceiptPage from "./pages/EditReceiptPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ReceiptListPage />} />
          <Route path="/create" element={<CreateReceiptPage />} />
          <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
          <Route path="/receipts/:id/edit" element={<EditReceiptPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
