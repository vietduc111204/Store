alter table "KhuyenMai"
add column if not exists "ngayBatDau" date,
add column if not exists "ngayKetThuc" date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_khuyenmai_thoihan'
  ) then
    alter table "KhuyenMai"
    add constraint chk_khuyenmai_thoihan
    check ("ngayBatDau" is null or "ngayKetThuc" is null or "ngayBatDau" <= "ngayKetThuc");
  end if;
end $$;
