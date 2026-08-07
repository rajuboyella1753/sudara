import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import QRCode from 'qrcode';
import { 
  ShoppingBag, Package, Plus, Trash2, Edit3, Download, Menu,
  Power, LogOut, X, UploadCloud, Settings, Image as ImageIcon, Search, Phone, MapPin, Key, User
} from "lucide-react";

export default function GroceryDashboard() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [products, setProducts] = useState([]);
  const [masterCatalog, setMasterCatalog] = useState([]); 
  const [isAddModal, setIsAddModal] = useState(false);
  const [isMasterModal, setIsMasterModal] = useState(false); 
  const [isEditModal, setIsEditModal] = useState(false);
  const [isSettingsModal, setIsSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");
  const [activeTab, setActiveTab] = useState("inventory");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [newGrocery, setNewGrocery] = useState({
    name: "",
    subCategory: "Daily Essentials",
    price: "",
    description: "",
    isAvailable: true
  });
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [storeSettings, setStoreSettings] = useState({
    name: "",
    phone: "",
    address: "",
    upiNumber: "",
    fssaiNumber: "",
    gstNumber: "",
    latitude: "",
    longitude: ""
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
      upiNumber: stored.upiNumber || stored.phone || "",
      fssaiNumber: stored.fssaiNumber || "",
      gstNumber: stored.gstNumber || "",
      latitude: stored.latitude || "",
      longitude: stored.longitude || ""
    });
    setStoreImagePreview(stored.image || stored.hotelImage || "");
    fetchProducts(stored._id);
    fetchMasterCatalog();
  }, [navigate]);

  const fetchProducts = async (ownerId) => {
    try {
      const res = await api.get(`/items/owner/${ownerId}`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch grocery items");
    }
  };
// ⏳ రోజుల కౌంట్‌డౌన్ లాజిక్
  const daysRemaining = useMemo(() => {
    if (!owner?.nextBillingDate) return 0;
    const today = new Date();
    const expiry = new Date(owner.nextBillingDate);
    const differenceInTime = expiry.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays < 0 ? 0 : differenceInDays;
  }, [owner]);
const fetchMasterCatalog = async () => {
    try {
      // 💡 కేవలం గ్రాసరీ ఐటమ్స్ మాత్రమే వచ్చేలా కేటగిరీ పంపిస్తున్నాం
      const res = await api.get(`/items/master-catalog?category=Grocery`);
      setMasterCatalog(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Master catalog fetch fallback");
    }
  };

  const handleToggleStore = async () => {
    try {
      const updatedStatus = !owner.isStoreOpen;
      const res = await api.put(`/owner/update-status/${owner._id}`, { isStoreOpen: updatedStatus });
      setOwner({ ...owner, isStoreOpen: res.data.isStoreOpen });
      localStorage.setItem("owner", JSON.stringify({ ...owner, isStoreOpen: res.data.isStoreOpen }));
    } catch (err) {
      alert("స్టేటస్ అప్‌డేట్ కాలేదు / Status update failed");
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

  const captureGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStoreSettings({
            ...storeSettings,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          alert("లొకేషన్ విజయవంతంగా క్యాప్చర్ చేయబడింది! / GPS Location Captured Successfully! 📍");
        },
        (error) => {
          alert("లొకేషన్ పొందడం విఫలమైంది. పర్మిషన్ ఇవ్వండి / Failed to fetch location.");
        }
      );
    } else {
      alert("మీ బ్రౌజర్ లొకేషన్ సపోర్ట్ చేయదు / Geolocation is not supported.");
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
      formData.append("upiNumber", storeSettings.upiNumber);
      formData.append("fssaiNumber", storeSettings.fssaiNumber);
      formData.append("gstNumber", storeSettings.gstNumber);
      formData.append("latitude", storeSettings.latitude);
      formData.append("longitude", storeSettings.longitude);

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
      alert("స్టోర్ సెట్టింగ్స్ విజయవంతంగా సేవ్ అయ్యాయి! / Store settings updated successfully! ✅");
    } catch (err) {
      alert(err.response?.data?.message || "సెట్టింగ్స్ అప్‌డేట్ చేయడం విఫలమైంది.");
    } finally {
      setLoading(false);
    }
  };

const handleAddGrocery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ownerId", owner._id);
      formData.append("name", newGrocery.name);
      formData.append("category", "Grocery");
      formData.append("subCategory", newGrocery.subCategory);
      formData.append("price", Number(newGrocery.price));
      formData.append("description", newGrocery.description || "");
      formData.append("isAvailable", String(newGrocery.isAvailable));
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/items/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setIsAddModal(false);
      setNewGrocery({ name: "", subCategory: "Daily Essentials", price: "", description: "", isAvailable: true });
      setImageFile(null);
      setImagePreview("");
      fetchProducts(owner._id);
      fetchMasterCatalog();
    } catch (err) {
      alert(err.response?.data?.message || "ఐటమ్ యాడ్ అవ్వడం విఫలమైంది.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromMaster = async (masterItem) => {
    try {
      setLoading(true);
      const payload = {
        ownerId: owner._id,
        name: masterItem.name,
        category: "Grocery",
        subCategory: masterItem.subCategory || "Daily Essentials",
        price: Number(masterItem.price) || 50,
        description: masterItem.description || "Fresh Essential",
        image: masterItem.image || "",
        isAvailable: true
      };

      await api.post("/items/add-from-master", payload);
      fetchProducts(owner._id);
      alert(`"${masterItem.name}" మీ స్టోర్‌కి విజయవంతంగా జోడించబడింది! ✅`);
    } catch (err) {
      alert("మాస్టర్ కేటలాగ్ నుండి ఇంపోర్ట్ అవ్వడం విఫలమైంది.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditGrocery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editingItem.name);
      formData.append("category", "Grocery");
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
      alert("అప్‌డేట్ చేయడం విఫలమైంది.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(`https://sudara.in/restaurant/${owner?._id}`, {
        width: 550,
        margin: 1,
        errorCorrectionLevel: 'H'
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 1200;
      canvas.height = 1900; 

      ctx.fillStyle = "#0F172A"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#065F46");
      gradient.addColorStop(1, "#047857");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, 400);
      ctx.quadraticCurveTo(canvas.width / 2, 480, 0, 400);
      ctx.fill();

      const storeName = owner?.name?.toUpperCase() || "SUDARA GROCERY";
      let fontSize = 90;
      if (storeName.length > 15) fontSize = 70;

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(storeName, canvas.width / 2, 230, 1000);

      ctx.fillStyle = "#A7F3D0";
      ctx.font = "bold 40px sans-serif";
      ctx.fillText("హైపర్‌కలోకల్ గ్రోసరీ & ఎసెన్షియల్స్ హబ్", canvas.width / 2, 320);

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 60;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(250, 480, 700, 700, 60); 
      ctx.fill();
      ctx.restore();

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 325, 555, 550, 550);

        ctx.fillStyle = "#047857";
        ctx.font = "bold 45px sans-serif";
        ctx.fillText("గ్రోసరీ ఆర్డర్ చేయడానికి స్కాన్ చేయండి", canvas.width / 2, 1260); 

        const pathText = "SCAN ➔ BROWSE ➔ DIRECT UPI / PAYTM PAYMENT";
        ctx.font = "bold 26px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText(pathText, canvas.width / 2, 1330);

        const steps = [
            "1. కెమెరాతో క్యూఆర్ కోడ్ స్కాన్ చేయండి",
            "2. రోజువారీ సరుకులు, పప్పులు, నూనెలు చూడండి",
            "3. జీరో కమిషన్‌తో నేరుగా ఆర్డర్ చేయండి"
        ];
        ctx.font = "600 36px sans-serif";
        steps.forEach((text, i) => {
            const barY = 1400 + (i * 90);
            ctx.fillStyle = "rgba(4, 120, 87, 0.05)";
            ctx.beginPath();
            ctx.roundRect(200, barY, 800, 70, 15);
            ctx.fill();
            ctx.fillStyle = "#1E293B";
            ctx.fillText(text, canvas.width / 2, barY + 45);
        });

        ctx.fillStyle = "#D97706"; 
        ctx.font = "italic bold 30px sans-serif";
        ctx.fillText("💡 PhonePe / GPay / Paytm నంబర్: " + (owner?.upiNumber || owner?.phone || "నాట్ సెట్"), canvas.width / 2, 1725);

        ctx.textAlign = "center";
        ctx.font = "bold 30px sans-serif";
        ctx.fillStyle = "#475569"; 
        ctx.fillText("POWERED BY ", canvas.width / 2 - 190, 1830);
             
        ctx.fillStyle = "#D97706"; 
        ctx.fillText("SUDARA HUB", canvas.width / 2 + 30, 1830);
             
        ctx.fillStyle = "#475569";
        ctx.fillText(" • sudara.in", canvas.width / 2 + 220, 1830);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1.0);
        link.download = `${owner?.name || "Grocery"}_Poster.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    } catch (err) {
      console.error("QR Generation Error:", err);
      alert("QR కోడ్ జనరేట్ అవ్వడంలో లోపం.");
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const nextStatus = !item.isAvailable;
      await api.put(`/items/update-availability/${item._id}`, { isAvailable: nextStatus });
      setProducts(products.map(p => p._id === item._id ? { ...p, isAvailable: nextStatus } : p));
    } catch (err) {
      alert("స్టాక్ స్టేటస్ అప్‌డేట్ అవ్వలేదు");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("ఈ ఐటమ్‌ని తొలగించాలనుకుంటున్నారా? / Remove this item?")) return;
    try {
      await api.delete(`/items/delete/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert("తొలగించడం విఫలమైంది.");
    }
  };

  const filteredProducts = products.filter(item => {
    if (selectedCategoryTab === "All") return true;
    return item.subCategory?.toLowerCase() === selectedCategoryTab.toLowerCase();
  });

  const downloadCertificate = () => {
    try {
      const name = owner?.name || "SUDARA PARTNER";
      const district = owner?.district || "NTR";
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
            .outer-border { width: 269mm; height: 182mm; border: 4px solid #047857; padding: 4mm; box-sizing: border-box; position: relative; }
            .inner-border { width: 100%; height: 100%; border: 2px solid #d97706; padding: 12mm; box-sizing: border-box; position: relative; text-align: center; background: #fafaf9; }
            .header .title { font-family: 'Cinzel', serif; font-size: 34pt; font-weight: 800; color: #047857; text-transform: uppercase; margin: 0; }
            .header .subtitle { font-size: 8.5pt; font-weight: 800; letter-spacing: 0.45em; color: #d97706; text-transform: uppercase; margin: 3mm 0 0 0; }
            .cert-label { font-size: 11pt; font-weight: 800; letter-spacing: 0.3em; color: #64748b; text-transform: uppercase; margin-top: 8mm; }
            .present { font-size: 12pt; font-style: italic; color: #475569; margin-top: 3mm; font-family: 'Georgia', serif; }
            .hub-name { font-family: 'Cinzel', serif; font-size: 26pt; font-weight: 800; color: #1e1b4b; margin: 4mm auto; border-bottom: 2px dashed #cbd5e1; display: inline-block; padding-bottom: 2mm; min-width: 170mm; }
            .location { font-size: 9.5pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 1mm; }
            .location span { color: #047857; font-weight: 800; }
            .desc { font-size: 10.5pt; line-height: 1.6; color: #334155; max-width: 215mm; margin: 6mm auto 0 auto; text-align: center; font-weight: 500; }
            .footer { position: absolute; bottom: 12mm; width: 90%; left: 5%; }
            .meta { float: left; text-align: left; font-size: 8.5pt; color: #475569; line-height: 1.6; font-weight: 600; }
            .badge { display: inline-block; text-align: center; margin-top: -4mm; }
            .badge-icon { font-size: 32pt; }
            .badge-text { font-size: 7.5pt; font-weight: 800; color: #047857; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 1mm; }
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
                  <div class="subtitle">Hyperlocal Grocery & Essentials Ecosystem</div>
                </div>
                <div class="cert-label">Certificate of Verification (ధృవీకరణ పత్రం)</div>
                <div class="present">This establishment is officially recognized as an authorized hyperlocal grocery merchant</div>
                <div class="hub-name">${name}</div>
                <div class="location">Region: <span>${district} District, ${state}</span></div>
                <div class="desc">
                  This certifies that this grocery merchant has successfully integrated into the Sudara Network for direct, commission-free neighborhood commerce and digital empowerment.
                </div>
                <div class="footer">
                  <div class="meta">
                    <strong>ID:</strong> ${certificateId}<br>
                    <strong>Issued:</strong> ${issueDate}<br>
                    <strong>UPI Pay Number:</strong> ${owner?.upiNumber || owner?.phone || "N/A"}<br>
                    <strong>Status:</strong> Active & Verified
                  </div>
                  <div class="badge">
                    <div class="badge-icon">🛡️</div>
                    <div class="badge-text">Verified Grocery Node</div>
                  </div>
                  <div class="sig-block">
                    <div class="sig-stamp">✓ DIGITAL_INDIA</div>
                    <div class="sig-line"></div>
                    <div class="sig-text"><strong>Sudara Verification Team</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
        </html>
      `;

      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
      } else {
        alert("పాప్-అప్ బ్లాక్ చేయబడింది! దయచేసి అనుమతించండి / Popup blocked!");
      }
    } catch (err) {
      alert("సర్టిఫికెట్ జనరేట్ అవ్వడంలో లోపం ఏర్పడింది!");
    }
  };

  if (!owner) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-100">
      
      {/* HIDDEN QR CANVAS */}
      <div style={{ display: "none" }}>
        <QRCodeCanvas id="qr-gen" value={`https://sudara.in/restaurant/${owner?._id}`} size={180} level="H" />
      </div>

      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-3 sm:px-6 lg:px-12 py-3 flex justify-between items-center shadow-xs w-full">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shrink-0"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden bg-emerald-50 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              {(owner?.image || owner?.hotelImage) ? (
                <img src={owner.image || owner.hotelImage} alt={owner.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              )}
            </div>
            <div className="min-w-0 flex flex-col justify-center">
  <h1 className="text-[11px] sm:text-sm font-black uppercase tracking-wider text-slate-900 truncate max-w-[100px] xs:max-w-[130px] sm:max-w-xs leading-tight">
    {owner.name}
  </h1>
  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
    <p className="text-[7px] sm:text-[8px] font-extrabold uppercase text-purple-600 tracking-widest truncate">గ్రోసరీ & ఎసెన్షియల్స్ హబ్</p>
    {daysRemaining > 0 ? (
      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
        ⏳ {daysRemaining}D Left
      </span>
    ) : (
      <button 
        onClick={() => alert("Admin కి సంప్రదించండి!")} 
        className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase animate-bounce shrink-0"
      >
        ⚠️ Renew
      </button>
    )}
  </div>
</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button 
            onClick={handleToggleStore}
            className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider transition-all shadow-xs ${owner.isStoreOpen ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}
          >
            <Power className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="hidden xs:inline">{owner.isStoreOpen ? 'Online (తెరిచి ఉంది)' : 'Offline (మూసి ఉంది)'}</span>
            <span className="xs:hidden">{owner.isStoreOpen ? 'Open' : 'Close'}</span>
          </button>

          <button 
            onClick={() => setIsSettingsModal(true)}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shrink-0"
            title="Store Settings (సెట్టింగ్స్)"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button 
            onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shrink-0"
            title="Sign Out (లాగౌట్)"
          >
            <LogOut className="w-3 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        
        {activeTab === "inventory" && (
          <>
            {/* TOP CONTROLS & ADD BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">గ్రోసరీ ఇన్వెంటరీ కేటలాగ్ / Grocery Inventory</h2>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">సరుకులు, ధరలు మరియు మాస్టర్ క్యాటలాగ్ మేనేజ్‌మెంట్</p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button 
                  onClick={() => setIsMasterModal(true)}
                  className="flex-1 sm:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 sm:px-5 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> మాస్టర్ నుండి తెచ్చుకోండి / Import
                </button>
                <button 
                  onClick={() => setIsAddModal(true)}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" /> కొత్త ఐటమ్ / Add Item
                </button>
              </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-2.5 w-max">
                {[
                  { label: "అన్నీ / All Items", key: "All" },
                  { label: "డైలీ ఎసెన్షియల్స్ / Daily Essentials", key: "Daily Essentials" },
                  { label: "బియ్యం & పప్పులు / Rice & Dals", key: "Rice & Dals" },
                  { label: "నూనెలు / Oils & Ghee", key: "Oils & Ghee" },
                  { label: "స్నాక్స్ / Snacks & Biscuits", key: "Snacks & Biscuits" },
                  { label: "వ్యక్తిగత సంరక్షణ / Personal Care", key: "Personal Care" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedCategoryTab(tab.key)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xs shrink-0 ${selectedCategoryTab === tab.key ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCT GRID */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 sm:p-16 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-black uppercase text-slate-700 tracking-wider">ఐటమ్స్ ఏవీ లేవు / No Items Found</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">పైన ఉన్న 'Import from Master' లేదా 'Add Custom Item' ద్వారా జోడించండి.</p>
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
                          <ShoppingBag className="w-10 h-10 text-slate-300" />
                        )}
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-700 text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {item.subCategory || "Grocery"}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 space-y-1.5">
                        <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight truncate">{item.name}</h3>
                        <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                        <div className="pt-2">
                          <span className="text-base font-black text-emerald-600">₹{item.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
                      <button 
                        onClick={() => handleToggleAvailability(item)}
                        className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all ${item.isAvailable !== false ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
                      >
                        {item.isAvailable !== false ? 'స్టాక్‌లో ఉంది / In Stock' : 'స్టాక్ లేదు / Out of Stock'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => { setEditingItem(item); setImagePreview(item.image); setIsEditModal(true); }} 
                          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="సవరించు / Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(item._id)} 
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="తొలగించు / Delete"
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
              గ్రోసరీ హబ్ ప్రొఫైల్<br/><span className="text-emerald-600">& వెరిఫికేషన్ సర్టిఫికెట్</span>
            </h2>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 md:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden w-full">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shrink-0 mx-auto sm:mx-0">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-base md:text-lg font-black text-white uppercase tracking-tight italic">సుడరా వెరిఫైడ్ మర్చంట్ / Verified Partner</h4>
                    <p className="text-slate-400 text-[11px] md:text-xs mt-1 max-w-2xl font-medium leading-relaxed uppercase tracking-wider">
                      మీ అధికారిక మర్చంట్ భాగస్వామ్య సర్టిఫికెట్‌ను డౌన్‌లోడ్ చేసుకోండి.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={downloadCertificate}
                  className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-[0.2em] px-6 py-3.5 rounded-xl shadow-lg active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <span>సర్టిఫికెట్ డౌన్‌లోడ్ / Download Certificate</span>
                  <span className="text-xs">⬇️</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-12 py-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Sudara Grocery Hub &copy; 2026 • డిజిటల్ ఇండియా హైపర్‌కలోకల్ నెట్‌వర్క్
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">క్లౌడ్ సింక్రనైజ్డ్ / Cloud Synced</span>
          </div>
        </div>
      </footer>

      {/* 🔍 MASTER CATALOG IMPORT MODAL */}
      <AnimatePresence>
        {isMasterModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-200 max-h-[85vh] flex flex-col">
              <button onClick={() => setIsMasterModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-slate-100 p-2 rounded-full text-slate-600"><X className="w-5 h-5"/></button>
              
              <div className="mb-4 pr-8">
                <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">గ్లోబల్ మాస్టర్ గ్రోసరీ కేటలాగ్</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ఇప్పటికే నెట్‌వర్క్‌లో ఉన్న సరుకులను ఎంచుకోండి / Select Pre-loaded Items</p>
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="వెతకండి (ఉదా: బియ్యం, పప్పు, నూనె)... / Search items..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {masterCatalog.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase">ఐటమ్స్ ఏవీ కనుగొనబడలేదు. కొత్తవి జోడించండి!</div>
                ) : (
                  masterCatalog
                    .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((mItem) => (
                      <div key={mItem._id || mItem.name} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/60 transition-all">
                        <div className="flex items-center gap-3">
                          <img src={mItem.image || "https://ui-avatars.com/api/?name=" + mItem.name} className="w-12 h-12 object-contain bg-white rounded-xl p-1 border" alt="" />
                          <div>
                            <h4 className="font-black uppercase text-xs text-slate-900">{mItem.name}</h4>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">{mItem.subCategory || "Grocery"}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAddFromMaster(mItem)}
                          className="bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                        >
                          + స్టోర్‌కి జోడించు / Add
                        </button>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚙️ STORE SETTINGS MODAL */}
      <AnimatePresence> 
        {isSettingsModal && ( 
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs"> 
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-200 max-h-[85vh] overflow-y-auto" > 
              <button onClick={() => setIsSettingsModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-all" > <X className="w-4 h-4"/> </button> 
              <div className="mb-5 pr-8"> 
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">స్టోర్ సెట్టింగ్స్ & పేమెంట్ వివరాలు</h3> 
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">లాగిన్ వివరాలు, ఫోన్‌పే నంబర్, జీపీఎస్ లొకేషన్ & ఇమేజ్</p> 
              </div>

              <form onSubmit={handleUpdateSettings} className="space-y-4">
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> లాగిన్ వివరాలు / Login Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">ఇమెయిల్ (Login ID)</label>
                      <input type="text" disabled value={owner.email || ""} className="w-full bg-slate-200/60 border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-600 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">పాస్‌వర్డ్ / Password</label>
                      <input type="text" disabled value={owner.password || "••••••••"} className="w-full bg-slate-200/60 border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-600 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">స్టోర్ / ఓనర్ పేరు / Store Name</label>
                  <input type="text" required value={storeSettings.name} onChange={(e)=>setStoreSettings({...storeSettings, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ఫోన్ నంబర్ / Phone Number</label>
                    <input type="text" value={storeSettings.phone} onChange={(e)=>setStoreSettings({...storeSettings, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-emerald-600 block mb-1 font-black">ఫోన్‌పే / UPI నంబర్ (Payment ID)</label>
                    <input type="text" placeholder="e.g. 9876543210 / UPI ID" value={storeSettings.upiNumber} onChange={(e)=>setStoreSettings({...storeSettings, upiNumber: e.target.value})} className="w-full bg-emerald-50/50 border border-emerald-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600 text-emerald-800" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">బిజినెస్ లైసెన్స్ / License No</label>
                    <input type="text" value={storeSettings.fssaiNumber} onChange={(e)=>setStoreSettings({...storeSettings, fssaiNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">GST నంబర్ / GST Number</label>
                    <input type="text" value={storeSettings.gstNumber} onChange={(e)=>setStoreSettings({...storeSettings, gstNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">స్టోర్ అడ్రస్ / Store Address</label>
                  <input type="text" value={storeSettings.address} onChange={(e)=>setStoreSettings({...storeSettings, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600" />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">స్టోర్ ఫోటో / Store Image</label>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleStoreImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    {storeImagePreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={storeImagePreview} alt="Store Preview" className="w-12 h-12 object-cover rounded-lg border" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">ఫోటో మార్చండి ✅ / Change Image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase">స్టోర్ ఫోటో అప్‌లోడ్ చేయండి / Upload Store Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> జీపీఎస్ లొకేషన్ / GPS Coordinates
                    </h4>
                    <button
                      type="button"
                      onClick={captureGPSLocation}
                      className="text-[9px] font-black uppercase bg-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-1"
                    >
                      📍 నా లొకేషన్ తీసుకోండి / Capture GPS
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">లాటిట్యూడ్ / Latitude</label>
                      <input 
                        type="number" 
                        step="any"
                        value={storeSettings.latitude || ""} 
                        onChange={(e)=>setStoreSettings({...storeSettings, latitude: e.target.value})} 
                        placeholder="e.g. 16.5062"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-emerald-600" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">లాంగిట్యూడ్ / Longitude</label>
                      <input 
                        type="number" 
                        step="any"
                        value={storeSettings.longitude || ""} 
                        onChange={(e)=>setStoreSettings({...storeSettings, longitude: e.target.value})} 
                        placeholder="e.g. 80.6480"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-emerald-600" 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-sm active:scale-95">
                  {loading ? "సేవ్ అవుతోంది..." : "సెట్టింగ్స్ సేవ్ చేయి / Save Settings"}
                </button>
              </form>
            </motion.div> 
          </div> 
        )} 
      </AnimatePresence>

      {/* 🚀 ADD CUSTOM ITEM MODAL */}
      <AnimatePresence>
        {isAddModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md p-6 sm:p-8 rounded-[2.5rem] shadow-xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsAddModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
              
              <div className="mb-5">
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">కొత్త ఐటమ్ జోడించు / Add Custom Item</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">మీ కేటలాగ్‌లో కొత్త సరుకును చేర్చండి</p>
              </div>

              <form onSubmit={handleAddGrocery} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ఐటమ్ పేరు / Item Name</label>
                  <input type="text" required placeholder="e.g. సోనా మసూరి బియ్యం 25kg" value={newGrocery.name} onChange={(e)=>setNewGrocery({...newGrocery, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">కేటగిరీ / Category</label>
                    <select value={newGrocery.subCategory} onChange={(e)=>setNewGrocery({...newGrocery, subCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600 cursor-pointer">
                      <option value="Daily Essentials">డైలీ ఎసెన్షియల్స్</option>
                      <option value="Rice & Dals">బియ్యం & పప్పులు</option>
                      <option value="Oils & Ghee">నూనెలు & నెయ్యి</option>
                      <option value="Snacks & Biscuits">స్నాక్స్ & బిస్కెట్లు</option>
                      <option value="Personal Care">పర్సనల్ కేర్</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ధర (₹) / Price</label>
                    <input type="number" required placeholder="1250" value={newGrocery.price} onChange={(e)=>setNewGrocery({...newGrocery, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-emerald-600" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ఫోటో / Product Image</label>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageChange} required className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    {imagePreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={imagePreview} alt="Preview" className="w-10 h-10 object-contain rounded-lg" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">ఫోటో ఎంపికైంది ✅</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase">ఫోటో అప్‌లోడ్ చేయండి / Browse</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">వివరాలు / Description</label>
                  <textarea placeholder="సరుకుల వివరాలు రాయండి..." value={newGrocery.description} onChange={(e)=>setNewGrocery({...newGrocery, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-xs outline-none focus:border-emerald-600 h-20 resize-none"></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-sm active:scale-95">
                  {loading ? "ప్రచురిస్తోంది..." : "ప్రచురించు / Publish Item"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📱 HUB MENU DRAWER MODAL */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[130] flex justify-start bg-slate-900/50 backdrop-blur-xs">
            <motion.div 
              initial={{ x: "-100%", opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: "-100%", opacity: 0 }} 
              className="bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 italic">గ్రోసరీ హబ్ మెనూ</h3>
                  <button onClick={() => setIsSidebarOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-all">
                    <X className="w-5 h-5"/>
                  </button>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => { setActiveTab("inventory"); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Package className="w-4 h-4 text-emerald-600" /> ఇన్వెంటరీ కేటలాగ్ / Inventory
                  </button>

                  <button 
                    onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Settings className="w-4 h-4 text-emerald-600" /> ట్రస్ట్ & సర్టిఫికెట్ / Certificate
                  </button>

                  <button 
                    onClick={() => { downloadQRCode(); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Download className="w-4 h-4 text-emerald-600" /> క్యూఆర్ పోస్టర్ డౌన్‌లోడ్ / QR Poster
                  </button>

                  <button 
                    onClick={() => { setIsSettingsModal(true); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Settings className="w-4 h-4 text-emerald-600" /> స్టోర్ సెట్టింగ్స్ / Settings
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sudara Grocery Node • డిజిటల్ ఇండియా</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}