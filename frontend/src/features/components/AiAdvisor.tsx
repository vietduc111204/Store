import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/libs/axios";

type AiMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiAdvisorProps = {
  product?: {
    maSanPham: number;
    tenSanPham: string;
    tenDanhMuc: string;
    gia: number;
    giaSauGiam: number;
    soLuong: number;
    soLuongDaBan: number;
    specs?: Array<{ label: string; value: string }>;
  };
};

export const AiAdvisor = ({ product }: AiAdvisorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const askAiAdvisor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = aiInput.trim();
    if (!message || aiLoading) return;

    const userMessage: AiMessage = { role: "user", content: message };
    const nextMessages = [...aiMessages, userMessage];

    setAiMessages(nextMessages);
    setAiInput("");
    setAiLoading(true);

    try {
      const res = await api.post<{ answer: string }>("/ai/tu-van", {
        message,
        history: aiMessages,
        product,
      });

      setAiMessages([...nextMessages, { role: "assistant", content: res.data.answer }]);
    } catch (error) {
      console.error(error);
      toast.error("Chưa thể tư vấn AI lúc này. Vui lòng kiểm tra cấu hình backend.");
      setAiMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Mình chưa kết nối được dịch vụ AI. Bạn có thể thử lại sau hoặc liên hệ nhân viên tư vấn.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]">
      {isOpen ? (
        <div className="flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 h-96">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-[#075f83] to-[#0879a8] px-5 py-4 rounded-t-2xl text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="font-black text-sm">Tư vấn AI</h3>
                <p className="text-xs font-semibold opacity-90">Hỏi nhanh về sản phẩm</p>
              </div>
            </div>
            <button
              className="rounded-lg hover:bg-white/20 p-1 transition"
              onClick={() => setIsOpen(false)}
              title="Đóng"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {aiMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 text-sm">
                <MessageCircle size={32} className="opacity-20 mb-2" />
                <p className="font-semibold">Xin chào! 👋</p>
                <p className="text-xs">Hỏi tôi bất kỳ điều gì về sản phẩm này</p>
              </div>
            )}
            {aiMessages.map((message, index) => (
              <div
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                key={`${message.role}-${index}`}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-xs rounded-2xl rounded-tr-sm bg-[#0879a8] px-4 py-2 text-sm leading-5 text-white"
                      : "max-w-xs rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2 text-sm leading-5 text-slate-700"
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                  <MessageCircle size={16} />
                  Đang tư vấn...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form className="border-t border-slate-200 p-3 flex gap-2" onSubmit={askAiAdvisor}>
            <input
              className="h-9 min-w-0 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#0879a8]"
              disabled={aiLoading}
              onChange={(event) => setAiInput(event.target.value)}
              placeholder="Nhập câu hỏi..."
              value={aiInput}
            />
            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-[#0879a8] text-white disabled:cursor-not-allowed disabled:bg-slate-300 transition hover:bg-[#075f83]"
              disabled={aiLoading || !aiInput.trim()}
              title="Gửi"
              type="submit"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <button
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#075f83] to-[#0879a8] text-white shadow-lg hover:shadow-xl transition hover:scale-110"
          onClick={() => setIsOpen(true)}
          title="Mở tư vấn AI"
        >
          <Sparkles size={24} />
        </button>
      )}
    </div>
  );
};
