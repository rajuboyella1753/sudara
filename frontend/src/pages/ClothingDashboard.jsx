import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import QRCode from 'qrcode';
import { 
  Shirt, Scissors, ShoppingBag, Watch, Plus, Trash2, Edit3, Download, Menu,
  Power, LogOut, Package, X, UploadCloud, Settings, Image as ImageIcon
} from "lucide-react";

export default function ClothingDashboard() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [products, setProducts] = useState([]);
  const [isAddModal, setIsAddModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isSettingsModal, setIsSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");
  const [activeTab, setActiveTab] = useState("inventory");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newApparel, setNewApparel] = useState({
    name: "",
    subCategory: "Men",
    price: "",
    description: "",
    isAvailable: true
  });
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [storeSettings, setStoreSettings] = useState({
    name: "",
    phone: "",
    address: "",
    fssaiNumber: "",
    gstNumber: ""
  });
  const [storeImageFile, setStoreImageFile] = useState(null);
  const [storeImagePreview, setStoreImagePreview] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("owner"));
    if (!stored) {
      navigate("/owner");
      return;
    }
    setOwner(stored);
    setStoreSettings({
      name: stored.name || "",
      phone: stored.phone || "",
      address: stored.address || "",
      fssaiNumber: stored.fssaiNumber || "",
      gstNumber: stored.gstNumber || ""
    });
    setStoreImagePreview(stored.image || "");
    fetchProducts(stored._id);
  }, [navigate]);

  const fetchProducts = async (ownerId) => {
    try {
      const res = await api.get(`/items/owner/${ownerId}`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch apparel items");
    }
  };

  const handleToggleStore = async () => {
    try {
      const updatedStatus = !owner.isStoreOpen;
      const res = await api.put(`/owner/update-status/${owner._id}`, { isStoreOpen: updatedStatus });
      setOwner({ ...owner, isStoreOpen: res.data.isStoreOpen });
      localStorage.setItem("owner", JSON.stringify({ ...owner, isStoreOpen: res.data.isStoreOpen }));
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStoreImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoreImageFile(file);
      setStoreImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", storeSettings.name);
      formData.append("phone", storeSettings.phone);
      formData.append("address", storeSettings.address);
      formData.append("fssaiNumber", storeSettings.fssaiNumber);
      formData.append("gstNumber", storeSettings.gstNumber);

      if (storeImageFile) {
        formData.append("image", storeImageFile);
      }

      const res = await api.put(`/owner/update/${owner._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const updatedOwner = res.data.owner || { ...owner, ...storeSettings, image: storeImagePreview };
      setOwner(updatedOwner);
      localStorage.setItem("owner", JSON.stringify(updatedOwner));
      setIsSettingsModal(false);
      alert("Store settings updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update store settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddApparel = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ownerId", owner._id);
      formData.append("name", newApparel.name);
      formData.append("category", "Clothing");
      formData.append("subCategory", newApparel.subCategory);
      formData.append("price", newApparel.price);
      formData.append("description", newApparel.description);
      formData.append("isAvailable", newApparel.isAvailable);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/items/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setIsAddModal(false);
      setNewApparel({ name: "", subCategory: "Men", price: "", description: "", isAvailable: true });
      setImageFile(null);
      setImagePreview("");
      fetchProducts(owner._id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add apparel item.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditApparel = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editingItem.name);
      formData.append("category", "Clothing");
      formData.append("subCategory", editingItem.subCategory);
      formData.append("price", editingItem.price);
      formData.append("description", editingItem.description || "");
      formData.append("isAvailable", editingItem.isAvailable);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.put(`/items/update/${editingItem._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setIsEditModal(false);
      setEditingItem(null);
      setImageFile(null);
      setImagePreview("");
      fetchProducts(owner._id);
    } catch (err) {
      alert("Failed to update apparel item.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      // 1. డైరెక్ట్ గా కోడ్ ద్వారానే QR ఇమేజ్ డేటా URL ని క్రియేట్ చేస్తున్నాం (ఇక DOM డిపెండెన్సీ ఉండదు)
      const qrDataUrl = await QRCode.toDataURL(`https://sudara.in/restaurant/${owner?._id}`, {
        width: 550,
        margin: 1,
        errorCorrectionLevel: 'H'
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 1200;
      canvas.height = 1900; 

      // బ్యాక్‌గ్రౌండ్ కలర్స్
      ctx.fillStyle = "#0F172A"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#4C1D95");
      gradient.addColorStop(1, "#7C3AED");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, 400);
      ctx.quadraticCurveTo(canvas.width / 2, 480, 0, 400);
      ctx.fill();

      const storeName = owner?.name?.toUpperCase() || "SUDARA STORE";
      let fontSize = 90;
      if (storeName.length > 15) fontSize = 70;
      if (storeName.length > 20) fontSize = 55;
      if (storeName.length > 25) fontSize = 45;

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(storeName, canvas.width / 2, 230, 1000);

      ctx.fillStyle = "#F472B6";
      ctx.font = "bold 40px sans-serif";
      ctx.fillText("APPAREL & FASHION CATALOG", canvas.width / 2, 320);

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 60;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(250, 480, 700, 700, 60); 
      ctx.fill();
      ctx.restore();

      // 2. క్యూఆర్ ఇమేజ్ ని లోడ్ చేసి కాన్వాస్ పై డ్రా చేయడం
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 325, 555, 550, 550);

        ctx.fillStyle = "#F472B6";
        ctx.font = "bold 45px sans-serif";
        ctx.fillText("HOW TO SHOP / EXPLORE", canvas.width / 2, 1260); 

        const pathText = "SCAN ➔ BROWSE APPAREL ➔ CHAT/CALL ➔ ORDER";
        ctx.font = "bold 28px sans-serif";
        ctx.fillStyle = "#CBD5E1";
        ctx.fillText(pathText, canvas.width / 2, 1330);

        const steps = [
            "1. Open Camera and scan QR code",
            "2. Browse latest outfits, ethnic & casual wear",
            "3. Connect directly for pricing & sizes"
        ];
        ctx.font = "600 36px sans-serif";
        steps.forEach((text, i) => {
            const barY = 1400 + (i * 90);
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
            ctx.beginPath();
            ctx.roundRect(200, barY, 800, 70, 15);
            ctx.fill();
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(text, canvas.width / 2, barY + 45);
        });

        ctx.fillStyle = "#FACC15"; 
        ctx.font = "italic bold 30px sans-serif";
        ctx.fillText("💡 Visit store for trial or check online collection anytime!", canvas.width / 2, 1725);

        ctx.textAlign = "center";
        ctx.font = "bold 30px sans-serif";
        ctx.fillStyle = "#475569"; 
        ctx.fillText("POWERED BY ", canvas.width / 2 - 190, 1830);
             
        ctx.fillStyle = "#FACC15"; 
        ctx.fillText("SUDARA HUB", canvas.width / 2 + 30, 1830);
             
        ctx.fillStyle = "#475569";
        ctx.fillText(" • sudara.in", canvas.width / 2 + 220, 1830);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1.0);
        link.download = `${owner?.name || "Clothing_Store"}_Poster.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    } catch (err) {
      console.error("QR Generation Error:", err);
      alert("QR Code loading error. Please try again.");
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const nextStatus = !item.isAvailable;
      await api.put(`/items/update-availability/${item._id}`, { isAvailable: nextStatus });
      setProducts(products.map(p => p._id === item._id ? { ...p, isAvailable: nextStatus } : p));
    } catch (err) {
      alert("Failed to update stock status");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Remove this apparel item from catalog?")) return;
    try {
      await api.delete(`/items/delete/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const filteredProducts = products.filter(item => {
    if (selectedCategoryTab === "All") return true;
    return item.subCategory?.toLowerCase() === selectedCategoryTab.toLowerCase();
  });

  if (!owner) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-purple-100">
      
      {/* 🤫 HIDDEN QR CANVAS FOR POSTER DOWNLOAD */}
      <div style={{ display: "none" }}>
        <QRCodeCanvas id="qr-gen" value={`https://sudara.in/restaurant/${owner?._id}`} size={180} level="H" />
      </div>

      {/* 👑 CLEAN & RESPONSIVE NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-3 sm:px-6 lg:px-12 py-3 flex justify-between items-center shadow-xs w-full">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {/* 🍔 Hamburger Menu Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shrink-0"
            title="Open Hub Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            {/* 🖼️ STORE IMAGE / BANNER INSTEAD OF ICON */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden bg-purple-50 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              {(owner?.image || owner?.hotelImage) ? (
                <img src={owner.image || owner.hotelImage} alt={owner.name} className="w-full h-full object-cover" />
              ) : (
                <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-[11px] sm:text-sm font-black uppercase tracking-wider text-slate-900 truncate max-w-[100px] xs:max-w-[130px] sm:max-w-xs">{owner.name}</h1>
              <p className="text-[8px] sm:text-[10px] font-extrabold uppercase text-purple-600 tracking-widest truncate">Clothing & Apparel Hub</p>
            </div>
          </div>
        </div>

        {/* Navbar Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button 
            onClick={handleToggleStore}
            className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider transition-all shadow-xs ${owner.isStoreOpen ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}
          >
            <Power className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="hidden xs:inline">{owner.isStoreOpen ? 'Online' : 'Offline'}</span>
            <span className="xs:hidden">{owner.isStoreOpen ? 'Open' : 'Close'}</span>
          </button>

          {/* Store Settings Button */}
          <button 
            onClick={() => setIsSettingsModal(true)}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shrink-0"
            title="Store Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button 
            onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-3 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </nav>

      {/* 📦 MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        
        {activeTab === "inventory" && (
          <>
            {/* TOP CONTROLS & ADD BUTTON */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">Apparel Inventory Catalog</h2>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage outfits, pricing, and stock visibility seamlessly</p>
              </div>
              <button 
                onClick={() => setIsAddModal(true)}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-5 sm:px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-md shadow-purple-100 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add New Apparel
              </button>
            </div>

            {/* CATEGORY TABS */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-2.5 w-max">
                {[
                  { label: "All Items", icon: Package, key: "All" },
                  { label: "Men", icon: Shirt, key: "Men" },
                  { label: "Women", icon: ShoppingBag, key: "Women" },
                  { label: "Kids", icon: Scissors, key: "Kids" },
                  { label: "Ethnic Wear", icon: Shirt, key: "Ethnic" },
                  { label: "Footwear & Accessories", icon: Watch, key: "Accessories" }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedCategoryTab(tab.key)}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xs shrink-0 ${selectedCategoryTab === tab.key ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRODUCT GRID */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 sm:p-16 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-black uppercase text-slate-700 tracking-wider">No Apparel Found</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Click 'Add New Apparel' to list items into your store.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((item) => (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={item._id} 
                    className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      <div className="w-full h-48 sm:h-52 bg-slate-100 overflow-hidden relative flex items-center justify-center p-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain drop-shadow-sm" />
                        ) : (
                          <Shirt className="w-10 h-10 text-slate-300" />
                        )}
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-700 text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {item.subCategory || "Apparel"}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 space-y-1.5">
                        <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight truncate">{item.name}</h3>
                        <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                        <div className="pt-2">
                          <span className="text-base font-black text-purple-600">₹{item.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
                      <button 
                        onClick={() => handleToggleAvailability(item)}
                        className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all ${item.isAvailable !== false ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
                      >
                        {item.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => { setEditingItem(item); setImagePreview(item.image); setIsEditModal(true); }} 
                          className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(item._id)} 
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <h2 className="text-4xl font-black italic uppercase text-slate-900">
              Owner<br/><span className="text-purple-600">Profile Matrix</span>
            </h2>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 md:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden w-full">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-lg shrink-0 mx-auto sm:mx-0">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h4 className="text-base md:text-lg font-black text-white uppercase tracking-tight italic">Sudara Trust & Verification</h4>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest">Active</span>
                    </div>
                    <p className="text-slate-400 text-[11px] md:text-xs mt-1 max-w-2xl font-medium leading-relaxed uppercase tracking-wider">
                      Download your official merchant partnership certificate to showcase community trust.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const name = owner?.name || "SUDARA PARTNER";
                      const district = owner?.district || "LOCAL";
                      const state = owner?.state || "ANDHRA PRADESH";
                      const certificateId = `SUDARA-2026-${(owner?._id || "HUBSOT").toString().slice(-6).toUpperCase()}`;
                      const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

                      const htmlContent = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="utf-8">
                        <style>
                          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;600;800&display=swap');
                          @page { size: A4 landscape; margin: 0; }
                          body { margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
                          .container { width: 297mm; height: 210mm; padding: 14mm; box-sizing: border-box; position: relative; background: #ffffff; }
                          .outer-border { width: 269mm; height: 182mm; border: 4px solid #581c87; padding: 4mm; box-sizing: border-box; position: relative; }
                          .inner-border { width: 100%; height: 100%; border: 2px solid #b45309; padding: 12mm; box-sizing: border-box; position: relative; text-align: center; background: #fafaf9; }
                          .header .title { font-family: 'Cinzel', serif; font-size: 34pt; font-weight: 800; color: #581c87; text-transform: uppercase; margin: 0; }
                          .header .subtitle { font-size: 8.5pt; font-weight: 800; letter-spacing: 0.45em; color: #b45309; text-transform: uppercase; margin: 3mm 0 0 0; }
                          .cert-label { font-size: 11pt; font-weight: 800; letter-spacing: 0.3em; color: #64748b; text-transform: uppercase; margin-top: 8mm; }
                          .present { font-size: 12pt; font-style: italic; color: #475569; margin-top: 3mm; font-family: 'Georgia', serif; }
                          .hub-name { font-family: 'Cinzel', serif; font-size: 26pt; font-weight: 800; color: #1e1b4b; margin: 4mm auto; border-bottom: 2px dashed #cbd5e1; display: inline-block; padding-bottom: 2mm; min-width: 170mm; }
                          .location { font-size: 9.5pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 1mm; }
                          .location span { color: #581c87; font-weight: 800; }
                          .desc { font-size: 10.5pt; line-height: 1.6; color: #334155; max-width: 215mm; margin: 6mm auto 0 auto; text-align: center; font-weight: 500; }
                          .footer { position: absolute; bottom: 12mm; width: 90%; left: 5%; }
                          .meta { float: left; text-align: left; font-size: 8.5pt; color: #475569; line-height: 1.6; font-weight: 600; }
                          .badge { display: inline-block; text-align: center; margin-top: -4mm; }
                          .badge-icon { font-size: 32pt; }
                          .badge-text { font-size: 7.5pt; font-weight: 800; color: #581c87; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 1mm; }
                          .sig-block { float: right; text-align: right; }
                          .sig-stamp { font-family: 'Courier New', monospace; font-size: 13pt; font-weight: 900; color: #16a34a; background: rgba(22, 163, 74, 0.08); padding: 2px 8px; border: 1.5px dashed #16a34a; border-radius: 4px; display: inline-block; transform: rotate(-2deg); }
                          .sig-line { width: 52mm; border-top: 1.5px solid #475569; margin: 3mm 0 2mm auto; }
                          .sig-text { font-size: 8pt; color: #475569; font-weight: 600; }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          <div class="outer-border">
                            <div class="inner-border">
                              <div class="header">
                                <div class="title">Sudara Hub</div>
                                <div class="subtitle">Hyperlocal Discovery Network</div>
                              </div>
                              <div class="cert-label">Certificate of Verification</div>
                              <div class="present">This establishment is officially recognized and verified as an elite partner</div>
                              <div class="hub-name">${name}</div>
                              <div class="location">Region: <span>${district} District, ${state}</span></div>
                              <div class="desc">
                                This verification certifies that the aforementioned establishment has successfully integrated into the Sudara Network ecosystem with high merchant compliance benchmarks.
                              </div>
                              <div class="footer">
                                <div class="meta">
                                  <strong>ID:</strong> ${certificateId}<br>
                                  <strong>Issued:</strong> ${issueDate}<br>
                                  <strong>Status:</strong> Active & Verified
                                </div>
                                <div class="badge">
                                  <div class="badge-icon">🛡️</div>
                                  <div class="badge-text">Verified Partner</div>
                                </div>
                                <div class="sig-block">
                                  <div class="sig-stamp">✓ OVT_Verified</div>
                                  <div class="sig-line"></div>
                                  <div class="sig-text"><strong>Owner Verifying Team (OVT)</strong></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </body>
                      </html>
                      `;

                      const oldFrame = document.getElementById('sudara-cert-iframe');
                      if (oldFrame) oldFrame.remove();

                      const iframe = document.createElement('iframe');
                      iframe.id = 'sudara-cert-iframe';
                      iframe.style.position = 'fixed';
                      iframe.style.right = '0';
                      iframe.style.bottom = '0';
                      iframe.style.width = '1px';
                      iframe.style.height = '1px';
                      iframe.style.border = 'none';
                      document.body.appendChild(iframe);

                      const iframeDoc = iframe.contentWindow.document || iframe.contentDocument;
                      iframeDoc.open();
                      iframeDoc.write(htmlContent);
                      iframeDoc.close();

                      const checkAndPrint = () => {
                        if (iframeDoc.body && iframeDoc.body.innerHTML.trim().length > 0) {
                          iframe.contentWindow.focus();
                          iframe.contentWindow.print();
                        } else {
                          setTimeout(checkAndPrint, 50);
                        }
                      };
                      checkAndPrint();
                    } catch (err) {
                      alert("Something went wrong!");
                    }
                  }}
                  className="w-full lg:w-auto bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-[10px] tracking-[0.2em] px-6 py-3.5 rounded-xl shadow-lg active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Download Certificate</span>
                  <span className="text-xs">⬇️</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 📌 FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-12 py-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Sudara Clothing & Apparel Hub &copy; 2026 • Secure Merchant Node
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Cloud Synchronized</span>
          </div>
        </div>
      </footer>

     {/* ⚙️ STORE SETTINGS MODAL */}
      <AnimatePresence> 
        {isSettingsModal && ( 
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs pt-16 sm:pt-20"> 
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-[2.5xl] shadow-2xl relative border border-slate-200 max-h-[85vh] overflow-y-auto scrollbar-custom" > 
              <button onClick={() => setIsSettingsModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-all" > <X className="w-4 h-4"/> </button> 
              <div className="mb-5 sm:mb-6 pr-8"> 
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">Store Settings & QR Hub</h3> 
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage profile, login credentials, interiors & store QR</p> 
              </div>

              <form onSubmit={handleUpdateSettings} className="space-y-4">
                {/* 🔑 LOGIN CREDENTIALS SECTION */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-600">Login Credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Email (Login ID)</label>
                      <input type="text" disabled value={owner.email || ""} className="w-full bg-slate-200/60 border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-600 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Password</label>
                      <input type="text" disabled value={owner.password || "••••••••"} className="w-full bg-slate-200/60 border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-600 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Store / Owner Name</label>
                  <input type="text" required value={storeSettings.name} onChange={(e)=>setStoreSettings({...storeSettings, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Phone Number</label>
                    <input type="text" value={storeSettings.phone} onChange={(e)=>setStoreSettings({...storeSettings, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Business License No</label>
                    <input type="text" value={storeSettings.fssaiNumber} onChange={(e)=>setStoreSettings({...storeSettings, fssaiNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">GST Number</label>
                  <input type="text" value={storeSettings.gstNumber} onChange={(e)=>setStoreSettings({...storeSettings, gstNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Store Address</label>
                  <input type="text" value={storeSettings.address} onChange={(e)=>setStoreSettings({...storeSettings, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                </div>

                {/* 🖼️ STORE MAIN BANNER IMAGE */}
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Store Main Banner / Cover Image</label>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleStoreImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    {storeImagePreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={storeImagePreview} alt="Store Preview" className="w-12 h-12 object-cover rounded-lg border" />
                        <span className="text-[10px] font-black text-purple-600 uppercase">Change Image ✅</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-purple-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase">Upload Main Banner</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📍 STORE LOCATION COORDINATES (GPS SYNC) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-600">Store GPS Coordinates</h4>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setStoreSettings({
                                ...storeSettings,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                              });
                              alert("Current GPS Location Captured Successfully! 📍");
                            },
                            (error) => { alert("Failed to fetch location. Please allow location access."); }
                          );
                        } else {
                          alert("Geolocation is not supported by your browser");
                        }
                      }}
                      className="text-[9px] font-black uppercase bg-purple-600 text-white px-3 py-1.5 rounded-xl shadow-sm hover:bg-purple-700 transition-all"
                    >
                      📍 Detect My GPS
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Latitude</label>
                      <input 
                        type="number" 
                        step="any"
                        value={storeSettings.latitude || ""} 
                        onChange={(e)=>setStoreSettings({...storeSettings, latitude: e.target.value})} 
                        placeholder="e.g. 13.6288"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-purple-600" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Longitude</label>
                      <input 
                        type="number" 
                        step="any"
                        value={storeSettings.longitude || ""} 
                        onChange={(e)=>setStoreSettings({...storeSettings, longitude: e.target.value})} 
                        placeholder="e.g. 79.4192"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-purple-600" 
                      />
                    </div>
                  </div>
                </div>

                {/* 🏢 INTERIOR / STORE GALLERY IMAGES */}
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Store Interior / Showcase Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {owner.interiorImages && owner.interiorImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border">
                        <img src={imgUrl} alt="Interior" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await api.put(`/owner/remove-interior-image/${owner._id}`, { imageUrl: imgUrl });
                              setOwner(res.data);
                              localStorage.setItem("owner", JSON.stringify(res.data));
                            } catch (err) { alert("Failed to remove image"); }
                          }}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 text-[8px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={async (e) => {
                        const files = Array.from(e.target.files);
                        if (files.length === 0) return;
                        setLoading(true);
                        try {
                          const uploadedUrls = [];
                          for (let file of files) {
                            const data = new FormData();
                            data.append("image", file);
                            const uploadRes = await api.post(`/owner/update-profile-pic/${owner._id}`, data);
                            if (uploadRes.data.url) uploadedUrls.push(uploadRes.data.url);
                          }
                          if (uploadedUrls.length > 0) {
                            const res = await api.put(`/owner/add-interior-images/${owner._id}`, { images: uploadedUrls });
                            setOwner(res.data);
                            localStorage.setItem("owner", JSON.stringify(res.data));
                            alert("Interior images added successfully!");
                          }
                        } catch (err) {
                          alert("Failed to upload interior images");
                        } finally {
                          setLoading(false);
                        }
                      }} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    />
                    <span className="text-[10px] font-black text-purple-600 uppercase">+ Upload Interior Photos</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-purple-600 transition-all shadow-sm active:scale-95 disabled:bg-slate-300">
                  {loading ? "Saving..." : "Save Settings"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 ADD APPAREL MODAL */}
      <AnimatePresence>
        {isAddModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsAddModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
              
              <div className="mb-5 sm:mb-6">
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">Add New Apparel</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">List a new outfit to your store catalog</p>
              </div>

              <form onSubmit={handleAddApparel} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Outfit / Item Name</label>
                  <input type="text" required placeholder="e.g. Designer Silk Saree / Casual Denim Shirt" value={newApparel.name} onChange={(e)=>setNewApparel({...newApparel, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Category / Section</label>
                    <select value={newApparel.subCategory} onChange={(e)=>setNewApparel({...newApparel, subCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600 cursor-pointer">
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                      <option value="Ethnic">Ethnic Wear</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Price (₹)</label>
                    <input type="number" required placeholder="1499" value={newApparel.price} onChange={(e)=>setNewApparel({...newApparel, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Product Image</label>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageChange} required className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    {imagePreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={imagePreview} alt="Preview" className="w-10 h-10 object-contain rounded-lg" />
                        <span className="text-[10px] font-black text-purple-600 uppercase">Image Selected ✅</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="w-5 h-5 text-purple-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase">Browse from device</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Description & Sizes</label>
                  <textarea placeholder="Sizes available, fabric details..." value={newApparel.description} onChange={(e)=>setNewApparel({...newApparel, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-xs outline-none focus:border-purple-600 h-20 resize-none"></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-purple-600 transition-all shadow-sm active:scale-95 disabled:bg-slate-300">
                  {loading ? "Publishing..." : "Publish Product"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛠️ EDIT APPAREL MODAL */}
      <AnimatePresence>
        {isEditModal && editingItem && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsEditModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
              
              <div className="mb-5 sm:mb-6">
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">Edit Apparel</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Update outfit specifications</p>
              </div>

              <form onSubmit={handleEditApparel} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Outfit Name</label>
                  <input type="text" required value={editingItem.name} onChange={(e)=>setEditingItem({...editingItem, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Category / Section</label>
                    <select value={editingItem.subCategory} onChange={(e)=>setEditingItem({...editingItem, subCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600 cursor-pointer">
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                      <option value="Ethnic">Ethnic Wear</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Price (₹)</label>
                    <input type="number" required value={editingItem.price} onChange={(e)=>setEditingItem({...editingItem, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-purple-600" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Update Image</label>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <div className="flex items-center justify-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-10 h-10 object-contain rounded-lg" />
                      <span className="text-[10px] font-black text-purple-600 uppercase">Change Image</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Description</label>
                  <textarea value={editingItem.description || ""} onChange={(e)=>setEditingItem({...editingItem, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-xs outline-none focus:border-purple-600 h-20 resize-none"></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-purple-600 transition-all shadow-sm active:scale-95 disabled:bg-slate-300">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📱 HUB MENU DRAWER MODAL */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[110] flex justify-start bg-slate-900/50 backdrop-blur-xs">
            <motion.div 
              initial={{ x: "-100%", opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: "-100%", opacity: 0 }} 
              className="bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 italic">Hub Menu</h3>
                  <button onClick={() => setIsSidebarOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-all">
                    <X className="w-5 h-5"/>
                  </button>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => { setActiveTab("inventory"); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Package className="w-4 h-4 text-purple-600" /> Inventory Management
                  </button>

                  <button 
                    onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Settings className="w-4 h-4 text-purple-600" /> Login Details & Certificate
                  </button>

                  <button 
                    onClick={() => { downloadQRCode(); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Download className="w-4 h-4 text-purple-600" /> Download QR Poster
                  </button>

                  <button 
                    onClick={() => { setIsSettingsModal(true); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Settings className="w-4 h-4 text-purple-600" /> Hub Settings
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sudara Clothing Hub Node</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}