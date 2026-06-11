do $$
declare
  item record;
begin
  for item in
    select table_schema, table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name in ('TaiKhoans', 'Quanlis')
  loop
    if item.column_name = 'TaiKhoans' then
      execute format(
        'alter table %I.%I rename column %I to %I',
        item.table_schema,
        item.table_name,
        item.column_name,
        'TaiKhoan'
      );
    end if;

    if item.column_name = 'Quanlis' then
      execute format(
        'alter table %I.%I rename column %I to %I',
        item.table_schema,
        item.table_name,
        item.column_name,
        'Quanli'
      );
    end if;
  end loop;
end $$;
