-- 1) Stage the combined, de-duplicated set into a temporary table
--    This merges your current rows (the list you just inserted)
--    with the earlier Hyderabad pin-code list you shared.
CREATE TEMPORARY TABLE tmp_areas AS
SELECT DISTINCT area_name, pincode
FROM (
  -- Current contents already in areas
  SELECT area_name, pincode FROM areas

  UNION ALL
  -- Earlier Hyderabad list (area_name, pincode)
  SELECT 'A.G.college','500030' UNION ALL
  SELECT 'A.Gs office','500004' UNION ALL
  SELECT 'A.Gs. staff quarters','500045' UNION ALL
  SELECT 'Administrative Buildings','500007' UNION ALL
  SELECT 'Afzalgunj','500012' UNION ALL
  SELECT 'Aliabad','500015' UNION ALL
  SELECT 'Ambernagar','500044' UNION ALL
  SELECT 'Amberpet','500013' UNION ALL
  SELECT 'Anandnagar','500004' UNION ALL
  SELECT 'Anantagiri','501201' UNION ALL
  SELECT 'Anantaram','500015' UNION ALL
  SELECT 'Andhra Mahila sabha','500044' UNION ALL
  SELECT 'Ankireddipalli','501301' UNION ALL
  SELECT 'Ankushapur','501301' UNION ALL
  SELECT 'Annajiguda','501301' UNION ALL
  SELECT 'Aperl','500030' UNION ALL
  SELECT 'Aphb Colony moulali','500040' UNION ALL
  SELECT 'Ashoknagar','500020' UNION ALL
  SELECT 'Attapur','500048' UNION ALL
  SELECT 'Atvelli','500015' UNION ALL
  SELECT 'Badangpet','500058' UNION ALL
  SELECT 'Bahadurpura','500064' UNION ALL
  SELECT 'Balapur','500005' UNION ALL
  SELECT 'Banjara Hills','500034' UNION ALL
  SELECT 'Barkatpura','500027' UNION ALL
  SELECT 'Bazarghat','500004' UNION ALL
  SELECT 'Begumbazar','500012' UNION ALL
  SELECT 'Begumpet','500016' UNION ALL
  SELECT 'Begumpet Policelines','500003' UNION ALL
  SELECT 'Bharat Nagar colony','500018' UNION ALL
  SELECT 'Bholakpur','500080' UNION ALL
  SELECT 'Boduppal','500039' UNION ALL
  SELECT 'Bogaram','501301' UNION ALL
  SELECT 'Central Police lines','500013' UNION ALL
  SELECT 'Central Secretariat','500022' UNION ALL
  SELECT 'Chanchalguda','500024' UNION ALL
  SELECT 'Chandulalbaradari','500064' UNION ALL
  SELECT 'Cherial','501301' UNION ALL
  SELECT 'Cherlapalli','501301' UNION ALL
  SELECT 'Crp Camp','500005' UNION ALL
  SELECT 'Cyberabad','500081' UNION ALL
  SELECT 'Dabirpur','500015' UNION ALL
  SELECT 'Dargah Hussain shahwali','500008' UNION ALL
  SELECT 'Darushifa','500024' UNION ALL
  SELECT 'Dattatreya Colony','500028' UNION ALL
  SELECT 'Dhoolpet','500006' UNION ALL
  SELECT 'Dilsukhnagar Colony','500060' UNION ALL
  SELECT 'Dr As rao nagar','500062' UNION ALL
  SELECT 'Ecil','500062' UNION ALL
  SELECT 'Erragadda','500018' UNION ALL
  SELECT 'Falaknuma','500053' UNION ALL
  SELECT 'Fatehdarwaza','500065' UNION ALL
  SELECT 'Fathenagar Colony','500018' UNION ALL
  SELECT 'Gagan Mahal','500029' UNION ALL
  SELECT 'Gajularamaram','500015' UNION ALL
  SELECT 'Gandhi Bhawan','500001' UNION ALL
  SELECT 'Gandhinagar','500080' UNION ALL
  SELECT 'Ghatkesar','501301' UNION ALL
  SELECT 'Girmapur','500015' UNION ALL
  SELECT 'Golconda','500008' UNION ALL
  SELECT 'Golconda Chowrastha','500020' UNION ALL
  SELECT 'Gowdavalli','500015' UNION ALL
  SELECT 'Gsi(sr) Bandlaguda','500068' UNION ALL
  SELECT 'Hanumanpet','500062' UNION ALL
  SELECT 'Hasannagar','500052' UNION ALL
  SELECT 'High Court','500066' UNION ALL
  SELECT 'Himayathnagar','500029' UNION ALL
  SELECT 'Himmatnagar','500025' UNION ALL
  SELECT 'Hindi Bhawan','500001' UNION ALL
  SELECT 'Hindustan Cables ltd','500051' UNION ALL
  SELECT 'Huda Residential complex','500035' UNION ALL
  SELECT 'Humayunnagar','500028' UNION ALL
  SELECT 'Hussainialam','500064' UNION ALL
  SELECT 'Hyd Airport ii','500016' UNION ALL
  SELECT 'Hyd Airport i','500016' UNION ALL
  SELECT 'Hyder Shah kote','500008' UNION ALL
  SELECT 'Hyderabad Jubilee','500002' UNION ALL
  SELECT 'Hyderabad Public school','500013' UNION ALL
  SELECT 'Hyderabad.','500001' UNION ALL
  SELECT 'Hyderguda','500048' UNION ALL
  SELECT 'I.E.nacharam','500076' UNION ALL
  SELECT 'I.M.colony','500082' UNION ALL
  SELECT 'Iict','500007' UNION ALL
  SELECT 'Ibrahim Bagh lines','500031' UNION ALL
  SELECT 'Ie Moulali','500040' UNION ALL
  SELECT 'Jaggamguda','500015' UNION ALL
  SELECT 'Jama I osmania','500007' UNION ALL
  SELECT 'Jeedimetla','500015' UNION ALL
  SELECT 'Jillellaguda','500079' UNION ALL
  SELECT 'Jntu Kukat pally','500085' UNION ALL
  SELECT 'Jubilee Hills','500033' UNION ALL
  SELECT 'Kakatiya Nagar','500008' UNION ALL
  SELECT 'Kanchanbagh','500058' UNION ALL
  SELECT 'Karmanghat','500079' UNION ALL
  SELECT 'Karwan Sahu','500006' UNION ALL
  SELECT 'Katchvanisingaram','501301' UNION ALL
  SELECT 'Kattedan Ie','500077' UNION ALL
  SELECT 'Keesara','501301' UNION ALL
  SELECT 'Keesaragutta','501301' UNION ALL
  SELECT 'Keshogiri','500005' UNION ALL
  SELECT 'Khairatabad','500004' UNION ALL
  SELECT 'Khapra','500062' UNION ALL
  SELECT 'Kingsway','500003' UNION ALL
  SELECT 'Kishanbagh','500064' UNION ALL
  SELECT 'Kismathpur','500030' UNION ALL
  SELECT 'Kolthur','500015' UNION ALL
  SELECT 'Korremal','501301' UNION ALL
  SELECT 'Kulsumpura','500067' UNION ALL
  SELECT 'Kushaiguda','500015' UNION ALL
  SELECT 'Kutbullapur','500015' UNION ALL
  SELECT 'Kyasaram','500062' UNION ALL
  SELECT 'L B nagar','500074' UNION ALL
  SELECT 'Lic Division','500063' UNION ALL
  SELECT 'Lalgadi Malakpet','500015' UNION ALL
  SELECT 'Lallaguda','500017' UNION ALL
  SELECT 'Lallapet','500017' UNION ALL
  SELECT 'Lunger House','500008' UNION ALL
  SELECT 'Mg Road','500003' UNION ALL
  SELECT 'Madhapur','500081' UNION ALL
  SELECT 'Malakpet Colony','500036' UNION ALL
  SELECT 'Mallapur','500076' UNION ALL
  SELECT 'Mamidipalli','500005' UNION ALL
  SELECT 'Mangalhat','500006' UNION ALL
  SELECT 'Mansoorabad','500068' UNION ALL
  SELECT 'Moazzampura','500001' UNION ALL
  SELECT 'Moghalpura','500002' UNION ALL
  SELECT 'Moosapet','500018' UNION ALL
  SELECT 'Moulali','500040' UNION ALL
  SELECT 'Mudchintanapalli','500015' UNION ALL
  SELECT 'Murad Nagar','500028' UNION ALL
  SELECT 'Musheerabad Dso','500020' UNION ALL
  SELECT 'Musheerabad Ndso','500020' UNION ALL
  SELECT 'Nallakunta','500044' UNION ALL
  SELECT 'Nanakramguda','500008' UNION ALL
  SELECT 'Napier Lines','500062' UNION ALL
  SELECT 'Narayanguda','500029' UNION ALL
  SELECT 'Nehrunagar','500026' UNION ALL
  SELECT 'New Maruthi nagar','500060' UNION ALL
  SELECT 'New Mla quarters','500063' UNION ALL
  SELECT 'New Nallakunta','500044' UNION ALL
  SELECT 'Ngri','500007' UNION ALL
  SELECT 'Nimboliadda','500027' UNION ALL
  SELECT 'Nutankal','500015' UNION ALL
  SELECT 'Old Malakpet','500036' UNION ALL
  SELECT 'Old Mla quarters','500029' UNION ALL
  SELECT 'Osmania General hospital','500012' UNION ALL
  SELECT 'Osmannagar','500036' UNION ALL
  SELECT 'P & t colony','500060' UNION ALL
  SELECT 'Padmaraonagar','500025' UNION ALL
  SELECT 'Padmavathi Nagar','500004' UNION ALL
  SELECT 'Pahadishareef','500005' UNION ALL
  SELECT 'Parishram Bhawan','500004' UNION ALL
  SELECT 'Pedalaxmapur','500015' UNION ALL
  SELECT 'Peerzadiguda','500039' UNION ALL
  SELECT 'Picket','500003' UNION ALL
  SELECT 'Pragatinagar','500015' UNION ALL
  SELECT 'Prakashamnagar','500016' UNION ALL
  SELECT 'Pratapsingaram','501301' UNION ALL
  SELECT 'Putlibowli','500095' UNION ALL
  SELECT 'Quazipura','500065' UNION ALL
  SELECT 'R.C.imarat','500069' UNION ALL
  SELECT 'Rahmath Nagar','500045' UNION ALL
  SELECT 'Rail Nilayam','500071' UNION ALL
  SELECT 'Raj Bhawan','500041' UNION ALL
  SELECT 'Rajbolaram','500016' UNION ALL
  SELECT 'Rajendranagar','500030' UNION ALL
  SELECT 'Ramakrishanapuram','500035' UNION ALL
  SELECT 'Ramakrishna Mutt','500029' UNION ALL
  SELECT 'Ramkoti','500095' UNION ALL
  SELECT 'Rampallidiara','501301' UNION ALL
  SELECT 'Rangareddy Dt courts','500074' UNION ALL
  SELECT 'Ravalkol','500015' UNION ALL
  SELECT 'Reinbazar','500023' UNION ALL
  SELECT 'Rompalli','501301' UNION ALL
  SELECT 'Sahifa','500024' UNION ALL
  SELECT 'Saidabad','500059' UNION ALL
  SELECT 'Saidabad Colony','500059' UNION ALL
  SELECT 'Sainagar','500017' UNION ALL
  SELECT 'Sakkubai Nagar','500008' UNION ALL
  SELECT 'Sanath Nagar colony','500018' UNION ALL
  SELECT 'Sanathnagar I e','500018' UNION ALL
  SELECT 'Sanjeev Reddy nagar','500038' UNION ALL
  SELECT 'Santoshnagar Colony','500059' UNION ALL
  SELECT 'Saroornagar','500035' UNION ALL
  SELECT 'Secunderabad','500003' UNION ALL
  SELECT 'Seetharampet','500001' UNION ALL
  SELECT 'Seminary','500013' UNION ALL
  SELECT 'Shahalibanda','500065' UNION ALL
  SELECT 'Shantinagar','500028' UNION ALL
  SELECT 'Shivarampalli','500052' UNION ALL
  SELECT 'Shyam Nagar','500004' UNION ALL
  SELECT 'Sitaphalmandi','500061' UNION ALL
  SELECT 'Snehapuri Colony','500076' UNION ALL
  SELECT 'Somajiguda','500082' UNION ALL
  SELECT 'South Banjara hills','500033' UNION ALL
  SELECT 'Srinagar Colony','500073' UNION ALL
  SELECT 'Srinivasapuram','500013' UNION ALL
  SELECT 'Sripuram Colony','500036' UNION ALL
  SELECT 'State Bank of hyderabad','500001' UNION ALL
  SELECT 'State Bank of india','500095' UNION ALL
  SELECT 'Stn Kachiguda','500027' UNION ALL
  SELECT 'Sultanshahi','500065' UNION ALL
  SELECT 'Suraram','500015' UNION ALL
  SELECT 'Survey Of india','500039' UNION ALL
  SELECT 'Svpnpa','500052' UNION ALL
  SELECT 'Swarajyanagar','500018' UNION ALL
  SELECT 'Tadbun','500064' UNION ALL
  SELECT 'Tagarikanaka','500002' UNION ALL
  SELECT 'Tarnaka','500007' UNION ALL
  SELECT 'Thimmaipalli','501301' UNION ALL
  SELECT 'Thumkunta','500015' UNION ALL
  SELECT 'Toli Chowki','500008' UNION ALL
  SELECT 'Turkapalliyadaram','500080' UNION ALL
  SELECT 'Uppal','500039' UNION ALL
  SELECT 'Uppuguda','500053' UNION ALL
  SELECT 'Vaidehinagar','500070' UNION ALL
  SELECT 'Vaishalinagar','500079' UNION ALL
  SELECT 'Vanastalipuram','500070' UNION ALL
  SELECT 'Vengal Rao nagar','500038' UNION ALL
  SELECT 'Vidhan Sabha','500004' UNION ALL
  SELECT 'Vidyanagar','500044' UNION ALL
  SELECT 'Vijay Nagar colony','500057' UNION ALL
  SELECT 'Vikarabad','501101' UNION ALL
  SELECT 'Yadgarpalli','501301' UNION ALL
  SELECT 'Yakutpura','500023' UNION ALL
  SELECT 'Yousufguda','500045' UNION ALL
  SELECT 'Zamistanpur','500020' UNION ALL
  SELECT 'Zindatelismath','500013'
) AS x;

-- 2) Reset the target table so area_id restarts from 1
TRUNCATE TABLE areas;

-- 3) Insert all columns, letting AUTO_INCREMENT generate area_id in alphabetical order
INSERT INTO areas (area_id, city_id, area_name, pincode, is_active, created_at, updated_at)
SELECT
  NULL              AS area_id,      -- include the column; NULL lets AUTO_INCREMENT assign 1..n
  1                 AS city_id,
  t.area_name       AS area_name,
  t.pincode         AS pincode,
  1                 AS is_active,
  NOW()             AS created_at,
  NOW()             AS updated_at
FROM tmp_areas t
ORDER BY t.area_name ASC, t.pincode ASC;

-- 4) Clean up
DROP TEMPORARY TABLE tmp_areas;
