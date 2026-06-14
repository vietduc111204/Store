const buildProductContext = (product) => {
  if (!product || typeof product !== 'object') return 'Không có sản phẩm cụ thể.';

  const specs = Array.isArray(product.specs)
    ? product.specs.map((spec) => `${spec.label}: ${spec.value}`).join('; ')
    : '';

  return [
    `Tên sản phẩm: ${product.tenSanPham || 'Không rõ'}`,
    `Danh mục: ${product.tenDanhMuc || 'Không rõ'}`,
    `Giá: ${product.gia ?? 'Không rõ'}`,
    `Giá sau giảm: ${product.giaSauGiam ?? 'Không rõ'}`,
    `Tồn kho: ${product.soLuong ?? 'Không rõ'}`,
    `Đã bán: ${product.soLuongDaBan ?? 'Không rõ'}`,
    specs ? `Thông số: ${specs}` : '',
  ].filter(Boolean).join('\n');
};

const buildFallbackAdvice = (message, product) => {
  const name = product?.tenSanPham || 'sản phẩm này';
  const category = product?.tenDanhMuc ? ` trong danh mục ${product.tenDanhMuc}` : '';
  const stock = Number(product?.soLuong);
  const sold = Number(product?.soLuongDaBan);
  const specs = Array.isArray(product?.specs) ? product.specs.slice(0, 3) : [];
  const specsText = specs.length
    ? ` Một số thông số đáng chú ý: ${specs.map((spec) => `${spec.label} ${spec.value}`).join(', ')}.`
    : '';
  const availability = Number.isFinite(stock)
    ? stock > 0
      ? `Hiện sản phẩm còn ${stock} trong kho.`
      : 'Hiện sản phẩm đang hết hàng, bạn nên liên hệ cửa hàng trước khi đặt.'
    : '';
  const socialProof = Number.isFinite(sold) && sold > 0 ? ` Sản phẩm đã bán ${sold}, có thể xem là đang được khách hàng quan tâm.` : '';
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('nên mua') || lowerMessage.includes('nen mua') || lowerMessage.includes('có nên') || lowerMessage.includes('co nen') || lowerMessage.includes('không') || lowerMessage.includes('khong')) {
    return [
      `Nếu bạn đang cần thiết bị smart home${category}, ${name} là lựa chọn nên cân nhắc.`,
      specsText,
      availability,
      socialProof,
      'Bạn nên mua nếu thông số phù hợp với nhu cầu thực tế, ngân sách và hệ sinh thái thiết bị đang dùng trong nhà.',
    ].filter(Boolean).join(' ');
  }

  if (lowerMessage.includes('lắp') || lowerMessage.includes('lap') || lowerMessage.includes('cài đặt') || lowerMessage.includes('cai dat')) {
    return [
      `${name} có thể cần kiểm tra vị trí lắp đặt, nguồn điện và kết nối mạng trước khi mua.`,
      specsText,
      'Nếu bạn chưa chắc về dây điện, mặt bằng lắp đặt hoặc khả năng tương thích, nên nhờ nhân viên kỹ thuật xác nhận trước.',
    ].filter(Boolean).join(' ');
  }

  return [
    `Với ${name}, bạn nên đối chiếu thông số, giá và nhu cầu sử dụng trước khi quyết định.`,
    specsText,
    availability,
    'Hiện backend chưa cấu hình OPENAI_API_KEY nên đây là phần tư vấn tạm thời của hệ thống.',
  ].filter(Boolean).join(' ');
};

export const adviseCustomer = async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const message = String(req.body?.message || '').trim();
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];
  const productContext = buildProductContext(req.body?.product);

  if (!message) {
    return res.status(400).json({ message: 'Vui lòng nhập câu hỏi cần tư vấn.' });
  }

  if (!apiKey) {
    return res.json({
      answer: buildFallbackAdvice(message, req.body?.product),
      mode: 'fallback',
    });
  }

  try {
    const messages = [
      {
        role: 'system',
        content:
          'Bạn là trợ lý tư vấn sản phẩm thông minh cho website bán thiết bị SmartHome chuyên nghiệp. ' +
          'Phân tích câu hỏi và trả lời theo hướng:\n' +
          '- Nếu hỏi về tính năng: Giải thích chi tiết, so sánh với sản phẩm khác nếu cần.\n' +
          '- Nếu hỏi về giá: Nhận xét giá cả, đề xuất khác nếu thích hợp, so sánh giá trị.\n' +
          '- Nếu hỏi về lắp đặt/sử dụng: Hướng dẫn cụ thể, cảnh báo vấn đề phổ biến.\n' +
          '- Nếu hỏi "nên mua không": Phân tích ưu nhược điểm, so sánh nhu cầu thực tế.\n' +
          '- Nếu hỏi chung: Giới thiệu sản phẩm một cách tự nhiên và thuyết phục.\n' +
          'Yêu cầu: Trả lời bằng tiếng Việt có dấu, tự nhiên (không máy móc), sử dụng từ ngôn ngữ hiện đại, tránh cấu trúc câu lặp lại. ' +
          'Nếu không chắc về thông tin, nói rõ cần kiểm tra với nhân viên tư vấn chuyên môn.',
      },
      ...history.map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: String(item.content || '').trim(),
      })),
      {
        role: 'user',
        content: [
          'Thông tin sản phẩm hiện tại:',
          productContext,
          `Câu hỏi khách hàng: ${message}`,
        ].filter(Boolean).join('\n\n'),
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 600,
        temperature: 0.9,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI advisor error:', data);
      return res.status(response.status).json({
        message: data?.error?.message || 'Không thể gọi dịch vụ AI lúc này.',
      });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return res.status(502).json({ message: 'AI chưa trả về nội dung tư vấn.' });
    }

    return res.json({ answer });
  } catch (error) {
    console.error('AI advisor failed:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi tư vấn AI.' });
  }
};

export const testAiConnection = async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'OPENAI_API_KEY không được cấu hình' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI API error',
        details: data,
      });
    }

    return res.json({
      status: 'ok',
      model: 'gpt-4o-mini',
      response: data?.choices?.[0]?.message?.content,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to connect to OpenAI',
      details: error.message,
    });
  }
};
