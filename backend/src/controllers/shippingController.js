const GHN_BASE = 'https://online-gateway.ghn.vn/shiip/public-api';
const GHN_TOKEN = process.env.GHN_TOKEN;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID;
const GHN_FROM_DISTRICT_ID = Number(process.env.GHN_FROM_DISTRICT_ID);

const ghnGet = async (path, extraHeaders = {}) => {
  const res = await fetch(`${GHN_BASE}${path}`, {
    headers: { Token: GHN_TOKEN, 'Content-Type': 'application/json', ...extraHeaders },
  });
  return res.json();
};

const ghnPost = async (path, body, extraHeaders = {}) => {
  const res = await fetch(`${GHN_BASE}${path}`, {
    method: 'POST',
    headers: { Token: GHN_TOKEN, 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const getProvinces = async (_req, res) => {
  try {
    const data = await ghnGet('/master-data/province');
    if (data.code !== 200) return res.status(502).json({ message: 'GHN: ' + data.message });
    const provinces = (data.data || [])
      .filter((p) => p.IsEnable === 1)
      .map((p) => ({ ProvinceID: p.ProvinceID, ProvinceName: p.ProvinceName }))
      .sort((a, b) => a.ProvinceName.localeCompare(b.ProvinceName, 'vi'));
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDistricts = async (req, res) => {
  const provinceId = req.query.provinceId;
  if (!provinceId) return res.status(400).json({ message: 'Thiếu provinceId' });
  try {
    const data = await ghnGet(`/master-data/district?province_id=${provinceId}`);
    if (data.code !== 200) return res.status(502).json({ message: 'GHN: ' + data.message });
    const districts = (data.data || [])
      .filter((d) => d.IsEnable === 1 && d.SupportType !== 0)
      .map((d) => ({ DistrictID: d.DistrictID, DistrictName: d.DistrictName }))
      .sort((a, b) => a.DistrictName.localeCompare(b.DistrictName, 'vi'));
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWards = async (req, res) => {
  const districtId = req.query.districtId;
  if (!districtId) return res.status(400).json({ message: 'Thiếu districtId' });
  try {
    const data = await ghnGet(`/master-data/ward?district_id=${districtId}`);
    if (data.code !== 200) return res.status(502).json({ message: 'GHN: ' + data.message });
    const wards = (data.data || [])
      .filter((w) => w.IsEnable === 1)
      .map((w) => ({ WardCode: w.WardCode, WardName: w.WardName }))
      .sort((a, b) => a.WardName.localeCompare(b.WardName, 'vi'));
    res.json(wards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const calculateFee = async (req, res) => {
  const { toDistrictId, toWardCode, weight = 500 } = req.body;
  if (!toDistrictId || !toWardCode) {
    return res.status(400).json({ message: 'Thiếu toDistrictId hoặc toWardCode' });
  }
  try {
    const data = await ghnPost(
      '/v2/shipping-order/fee',
      {
        service_type_id: 2,
        from_district_id: GHN_FROM_DISTRICT_ID,
        to_district_id: Number(toDistrictId),
        to_ward_code: String(toWardCode),
        height: 15,
        length: 20,
        width: 15,
        weight: Math.max(Number(weight) || 500, 1),
        insurance_value: 0,
      },
      { ShopId: String(GHN_SHOP_ID) }
    );
    if (data.code !== 200) return res.status(502).json({ message: 'GHN: ' + data.message });
    res.json({ phiVanChuyen: data.data?.total ?? 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
