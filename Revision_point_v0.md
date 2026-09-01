# 수정 포인트 V0
- Dashboard에서 summary export 기능을 추가해서, 메일봉투의 아이콘을 클릭하면, 요약정보가 메일 본문에 반영되서 수신처만 입력하면 바로 보낼 수 있는 기능을 추가해줘. 
- Activity list에서도 메일 봉투 아이콘을 추가해서, 클릭하면 outlook 이 열리면서 해당 acivity 내용들이 그대로 본문에 포함되어 담당자 이메일이 수신처에 포함되도록 해줘. TPM은 내용 및 수신처 확인 후, 수정해서 바로 메일을 보낼 수 있으면 돼. 
- 예를 들어 특정 stage의 일정을 변경해야 하는 경우가 생겼을 떄, 신규 일정이 반영된 마일스톤과 반영전 마일스톤을 비교할 수 있도록 두개 마일스톤이 동시에 표시되는 모드를 만들어줘. 검토 후, 최종 업데이트 버튼을 누르면 그대로 반영이 되도록 하면 좋겠어. 
- Stage Detail 부분의 내용을 Edit할 수 있는 기능을 포함시켜줘. 연필모양의 아이콘을 클릭하면 편집 모드로 전환이 되서, text 편집한 후 저장할 수 있도록 해줘.
- 게시글 및 status update 작성 시, 파일 첨부와 이미지 추가도 가능하도록 만들어줘. 

# 수정 포인트 V1
- Engineering contact에 입력된 사람들이, activity 나 risk 등 담당자 입력할 때, 이 contact에 포함된 사람들 중에서 선택할 수 있도록 drop down menu로 구성해줘. 모든 게시글의 담당자 필드에 적용해줘.
- Stage detail의 Engineering 부분에 각 항목별 Man-month 정보가 포함이 되어야해. 이 부분도 Key deliverables와 유사하게 table 형태로 만들고, M/M 정보를 입력할 수 있도록 해줘. 여기에 기입된 M/M를 전부 합하면, 해당 Stage를 완료하는데 필요한 M/M를 계산할 수 있게되고, 이 M/M 값이 위쪽 milestone graph의 막대그래프 위에 표시될 수 있도록 해줘. 
- 이 M/M정보를 사용하면, 전체 과제를 개발하는데 필요한 전체 Man-month를 계산할 수 있게되고, 이 값을 사용해서, 전체 프로젝트를 개발하는데 예상되는 전체 리소스 비용을 예측할 수 있지. 이 값은 제일 첫 페이지의 카드 내용으로 포함될 수 있도록 수정해줘.
  
# 수정 포인트 V2
- Stage detail에서 편집 모드로 들어갈때, Engineering activity는 제외하고, 게시판처럼 관리되도록 해줘. 각 항목을 추가/삭제 가능하도록 해주고, M/M도 입력 가능하도록 해줘. 
- milestone graph에서 MM 글씨크기를 11px로 키워줘. 
- 12개 stage가 milestone graph에 표시가 되어 있는데, x축 그래프에서는 제거해주고, y축에 12개 stage가 표시되도록 해줘. y축 legend의 글씨크기를 키워서, 확실히 구분이 될 수 있도록 해줘. 아래쪽 페이지는 해당 막대그래프를 선택하는 경우에만 표시되도록 수정해줘. x축에는 마름모로 표시된 일정만 남기되, 일정이 아래 막대그래프 일정와 align이 되도록 맞춰줘.

# 수정 포인트 V3
- Engineering activity에 M/M는 Edit mode에서만 변경가능하게 업데이트해줘. edit mode 아닐때는 그냥 display만 되도록. 
- key deliverables도 마찬가지로, edit mode에서만 날짜 수정이나 항목 추가가 가능하도록 해줘. 
- milestone graph에서 선택이 되었을때, 글씨들이 가려져서 잘 안보이는데, 이것도 조금 더 잘보이도록 업데이트해줘. 

# 수정 포인트 V4
- main page의 layout을 좀 변경했으면해. Stage details를 TAT 날짜 입력하는 창 아래로 옮겨주고, Key deliverables table의 높이가 Engineering activity와 algin되도록 수정해줘. 대신 Engineering contact는 제일 아래쪽에 그대로 유지해줘. 
- 각 stage의 이미지 사이즈를 좀 줄여서, TAT 입력창 bottom line을 넘어가지 않도록 조정해줘. 
- Stage detail과 Engieering contact 사이에 Activity가 좌즉, Risk와 key inforamtion 이 우측에 배치되도록 해줘. 
- Activity는 Status update 포함 10개 까지 포함되는 높이로 만들어주고, 그 오른쪽 상단에 Key information 5개 항목 높이, 오른쪽 하단에 Risk 5개 항목 높이로 만들어줘. 
- 상단 마일스톤 그래프의 y축 legend에 숫자를 추가해줘. 00.DEF, 01.ARCH 이런식으로 숫자를 앞에 추가해줘. 

# 수정 포인트 V5
- 게시글에 Add할때, 한번 add하고 나서 다시 add를 누르면 기존에 add할때 사용한 data가 그대로 남아 있어. 다시 빈상태로 리셋되도록 해줘.
- 게시글에 내용 입력하고 저장할때, 입력이 안된 항목이 있어서 저장이 안될경우, 경고 메시지를 표시해주고, 빈칸에 깜빡거리는 애니메이션을 줘서 어느 부분을 입력해야 하는지 알려줘.  
- 각 게시판의 사이즈를 고정해주고, 스크롤바를 표시해서, 내용이 많아지면 스크롤해서 볼 수 있도록 해줘. activity는 10개, key information은 5개, risk는 5개까지 표시되도록 해줘. 스크롤도 되지만 기존 show more 도 그대로 유지해줘. 현재는 show more 가 너무 멀리 떨어져 있어. 
- 게시글 작성 시, 파일첨부와 이미지 추가 기능도 넣어줘. 

# 수정 포인트 V6
- Activity 400px, Key information 300px, Risk 100px로 고정해줘. 
- 스크롤 확인할 수 있도록 각 게시판 글도 12개씩 만들어줘 (01.DEF만 예시, 다른 stage는 기존 개수 그대로).   
- 과제 화면 접속 시, main page의 default는 오늘 날짜에 해당되는 stage화면이 나타나도록 해주고. 여러개 stage가 중복되어 있을 경우에는 막대그래프에서 제일 아래쪽에 있는 stage를 default로 보여줘.
- Display setting 에서 Dash board setting의 default를 16/16/13/32로 해주고, 이 값이 중간에 오도록 해줘.
- Display Setting은 main에서는 main에만, dash board에서는 dashboard에만 적용되도록 해주고, display setting에서 main/dashboard 토글 기능은 삭제해줘. 
- Main 화면에서 하나의 stage를 선택하고, 마우스가 아래쪽으로 milestone 그래프 영역을 벗어나게 되면, milestone graph의 height축소해서, 선택된 stage의 그래프만 보이도록 업데이트해줘. 그리고 다시 milestone 영역으로 마우스가 오게 되면 자연스럽게 전체 마일스톤이 확대되면서, 전체 stage를 확인하고 다른 stage를 선택할 수 있도록 해줘. 이때 애니메이션 효과를 넣어서, 자연스럽게 확대 축소가 되도록 해줘.
- 게시글의 업데이트 날짜에서 시간정보는 제외해주고, show more 로 들어갔을때만 시간을 추가해줘.
- Dashboard에서 마일스톤의 Mass Production을 보면 글씨가 막대 그래프를 가리고 있는데, 모든 check point 및 날짜 정보가 막대그래프를 가리지 않도록 마름모 아이콘에서 화살표를 활용해서, 그 근처에 표시되도록 해줘. 통일성 있게 하면 좋아. 
- PROGRAMS 아이콘이 조금더 부각되도록 해주고, 그 아이콘과 display setting main/dashboard 아이콘을 제외한 다른 항목들은 가운데 정렬해줘.
- Stage를 추가/수정/삭제할 수 있는 메뉴도 만들어줘.
- 만약 Stage를 추가해서, 새로운 Profile이 생성되면, Profile의 이름을 변경하도록 하고, 상단 profile에 그 이름이 표시되도록 해줘. 다음에 새로운 프로젝트를 생성할 때, 이 신규 profile도 선택할 수 있도록 옵션으로 넣어줘. 

# 수정 포인트 V7
- 마일스토 그래프가 축소될때, Concurrency 문구 위쪽 부분은 그대로 남겨놓고, 막대그래프 부분만 축소되도록 해줘. 이때 month 정보도 그대로 남겨주고, 모든 달이 표시되도록 추가해줘. 또한 선택된 stage 앞뒤 stage는 함께 보일 수 있도록 해줘. 
- 마일스톤 축소 후 남겨진 마름모 point들의 일정 정보가 함께 표시되면 좋겠어. 현재는 마우스를 올려야만 표시되는데, 마름모 안에 8/16 형식으로 항상 표시되도록 해줘.
- Stage detail에서 Engineering activity 수정모드, Key Deliverable 수정모드를 별도로 동작하도록 만들어줘. 그리고 지금은 Engineering activity 추가를 해도 반영이 안되고 있으니 이것도 수정해줘. Key deliverables 입력 시, due date를 안 넣어도 추가가 되는데, due date를 안넣었을때에는 TBD로 표시를 할건지 물어보고, okay하면 TBD로 저장하고, 수정모드에서는 다시 날짜 입력이 가능하도록 해줘. 
- 마일스톤 그래프가 축소될때, 선택된 stage의 막대그래프가 확대되서 표시가 되게 해주고, 이 때에는 본문에 있는 Key deliverables의 일정들이 그 막대 그래프 위헤 마름모 아이콘으로 표시되도록 해줘. 마름모 안에 날짜가 8/16 형식으로 표시되게 해주고, delieverables name도 마름모 아이콘 위에 표시되도록 해줘. 물론 deliverables 정보가 업데이트되면 마름모 위치도 자동으로 조정되게 해줘.
- 그리고 stage 수정은 현재 프로젝트에 적용을 위한 옵션이지, 새로운 template 생성이 목적이 아니야. 현재 project에 적용하는 방식이 되도록 별도 Stage edit mode를 추가해주고, 수정후 저장할 수 있도록 해주고. 옵션으로 Save as template 버튼은 남겨서, 원하면 신규 profile로 추가 할 수 있도록 해줘. 그리고 이름 중복을 방지하는 옵션이 없는데, 중복된 이름으로 profile이 생성되지 않도록 방지할 수 있으면 좋겠어. 
- 그리고 stage 추가 옵션에 있는 LEGEND가 실제 마일스톤 페이지의 내용과 다르니 sync되도록 변경해줘. 예를 들면 DEF -> 01.DEF. 
- 본문의 게시판이 글이 없을때, show more 버튼이 너무 멀리 떨어져 있어서 보기가 이상해. 지금 설정된 각 게시판 크기에 도달하기 전까지는 게시글 개수에 따라서 크기가 가변될 수 있도록 해주고, max size에 도달하기 전까지는 show more 버튼이 마지막 게시글 바로 아래에 배치되도록 업데이트해줘. 

# 수정 포인트 V8
- 마일스톤 축소할때, 앞뒤로 하나씩 더 보여주는 옵션은 삭제하고, 선택한 stage만 보이도록 만들어줘. 내가 확대해달라고 한건 IP & RTL DEVELOPMENT stage가 3/12 ~6/4 일정이니깐 이 막대그래프가 전체 화면 가로축의 약 70% 정도 차지하도록 확대해서 가운데 정렬로 보이도록 하고, 이 막대그래프 위에, key deliverables의 일정이 마름모로 표시되도록 해줘. 이때 month의 위치도 확대된 비율만큼 같이 조정이 되어야 겠지. 완료된 건과 미완료된 건의 구분은 현재와 동일하게 유지해줘. 그러면 제일 위 마일스톤에서는 전체 과제의 흐름을 파악할 수 있고, 선택된 stage milestone에서는 해당 stage의 디테일한 정보를 파악할 수 있어.
- 전체 stage의 key deliverables 의 due date 일정이 동일한 날짜가 아닌 합리적인 일정으로 업데이트해서, 마치 실제 과제가 진행되고 있는 것처럼 보일 수 있게 해줘. 
- Key deliverables에서 항목완료 체크를 하면, due date 기준으로 색깔이 변경되는데, due date 기준이 아닌, 완료된 날짜 기준으로 아이콘이 움직이면서 색이 변경되도록 해줘. 완료된건 완료된 날짜가 보이고, 미완료된건 due date가 보이도록 하면돼.
- Key deliverables와 engineering acivity 게시판의 높이가 맞도록 수정해줘. 
- Activity 게시판의 높이는 600px로 키워주고, key information은 300px, RISK도 300px로 조정해줘. 
- 제일 위에 있는 menu의 순서를 바꿔줘. 과제명, Milestone template (Profile에서 이름 변경), Edit Tempate (STAGE에서 이름 변경) 순서로 만들어주고, 날짜 정보는 아래 마일스톤 그래프에 표시가 되어 있으니, 삭제해줘. 
- Kick-off 날짜가 빠져 있으니, Kick-off icon도 보이도록 업데이트해줘. 
- 현재는 어떤 icon은 검정색, 어떤 아이콘은 하얀색으로 되어 있는데, 현재 날짜 기준으로 지나간건은 검정색, 아직 안지나간건 하얀색으로 통일되게 업데이트 해줘. 
- 각 stage의 날짜 수정할때, 중간의 Week수를 수정해서 완료날짜가 자동으로 업데이트 되는 기능도 추가해줘. 시작날짜가 정해져 있으면 주수를 변경해서, 완료 날짜가 정해질수 있도록. 

# 수정 포인트 V9
- 마일스톤 축소 후, 남겨진 막대그래프의 두께가 너무 두꺼워, 이 두께를 메인 마일스톤의 막대그래프 두께와 동일하게 변경해줘. 
- 전체 마일스톤 그래프가 줄어들지 않고 그대로 유지되길 원할경우, 설정할 수 있는 핀아이콘을 추가해줘. 핀아이콘을 눌러서 선택해 놓으면 전체 마일스톤 페이지가 그래도 유지되도록해주고, 핀 헤제하면 다시 이전 기능으로 돌아가서 축소가 되도록 해줘. 
- Key deliverables 게시판의 높이가 Activity table과 안맞아. 높이를 좀 맞춰줘. 그리고 key deliverables의 편집모드에서는 completed date도 수정가능하도록 변경해줘. 최초에는 check box에 check한 날짜가 입력되지만, 그 이후에는 수정이 가능해야해. 
- 제일 위에 있는 마일스톤의 형식이 통일이 안되어 있어. 마름모모양의 외곽선이 어떤건 두껍고, 어떤건 얇아, 동일하게 얇은 선으로 변경해주고, 글씨체도 어떤건 bold고 어떤건 아니야, 통일해줘. 
- 게시판의 column들의 width가 불균일한데, title의 내용이 제일 많이 보일수 있도록 수정해줘. 
- 현재 ACTIVITY 게시판 높이에 align되도록, 오른쪽의 key information과 RISK 게시판의 크기를 변경해줘. key info가 60%, risk가 40% 정도로 하면 될 것 같아.
- show more를 눌렀을때, window내 아래쪽에 빈공간이 많은데, 여기를 활용해서 게시글 을 작성하고 수정할 수 있도록 변경해줘. 기존에는 게시글 선택 시, 다른 화면으로 전환되었는데, 한화면에서 모두 진행할 수 있도록 해줘. 
- 각 게시판의 제목은 좀더 눈에 띌 수 있도록 컬러와 크기를 좀 바꿔줘. 게시글의 글씨크기가 좀 큰것 같아. 16px을 default 값으로 변경해주고, display setting에서도 16px이 중간에 오도록 수정해줘. 

# 수정 포인트 V10
-  docs/stage-template-v2.html 을 참고해서, stage를 동일하게 만들어 주고, 각 stage 별 engineering activity 및 deliverables도 그대로 동일하게 반영해줘. TAT 및 M/M 정보도 동일하게 반영해줘. 
- docs/stage-template-v2.html에 보면 각 acitivity나 deliverables에 ID가 붙어 있어, DEF-01, DEF-D1 등등. 이런 ID를 각 row에 추가해줘. 
- key deliverables의 due date는 kick-off 날짜 기준으로 계산해서, 필요한 일정으로 반영해줘. 

# 수정 포인트 V11
- 남은 67건 마이그레이션 진행해줘.
- 최상위에 있는 마름모 모양으로 되어 있는 마일스톤을 바로 아래 마일스톤 그래프와 합쳐줘. 
- 그리고 TPM으로서 가장 신경써서 챙겨야 하는 Check point만 추가하고 나머지는 삭제해줘. 총 15개만 포함되도록 해줘. 
- 각 마름모 아이콘은 해당되는 stage의 막대그래프에 위치하도록 해주고, 이 아이콘의 사이즈만 변경할 수 있는 옵션을 display setting에 추가해줘. 기본값은 현재 사이즈로 해줘.
- 마일스톤 그래프에서 아래쪽 메인으로 마우스로 옯겨가면서 마일스톤 크기가 작아질때, 이미지가 깜박이는 현상이 생기는데, 이 문제도 수정해줘. 
- 축소된 마일스톤의 마름모 아이콘의 내용이 가로줄로 가려져 있는데, 이 가로줄은 없애줘. 이미 완료된 건 마름모 색깔과 글씨 색깔로 구분이 되고 있으니까.
- main 창의 text size 기본값을 15px로 변경해줘. 
- engineering activity의 TAT와 M/M column size가 너무 커서, 이 컬럼사이즈를 내용에 맞게 줄여서, task 내용이 최대한 많이 보일수 있게 해줘.  
- 모든 게시판에 줄바꿈 아이콘을 추가해서, 그 아이콘을 토글하면, 내용이 2줄 혹은 이상으로 모든 내용이 다 보이도록 해줘. 

# 수정 포인트 V12
- 마일스톤 그래프에서 kick off 부분이 좀 이상해, 이 kick-off 아이콘은 01.DEF stage로 옮겨서 표시되도록 해줘. 
- 마일스톤 그래프 스크롤 다운하면 15.Fab 부터는 세로 줄 표시라인이 보이지 않아, 마지막 스테이지까지 모두 연결되도록 수정해줘.
- 오늘 날짜를 표시하는 새로줄 라인이 있긴있는데, 이게 뭘 표시하는지 표현이 안되어 있으니, 오늘 날짜라고 알수 있도록 표시를 추가해줘. 
- 오늘 날짜에 막대그래프가 겹쳐 있는 stage들이 있을 텐데, 그 중에 제일 위에 있는 stage를 기준 앞 뒤로 5개 stage 가 표시되도록 수정해줘, 그러니간 총 11개의 stage만 표시되고, 나머지는 기존대로 스크롤로 확인해야겠지.
- 게시판의 줄바꿈 아이콘 위치를 edit 버튼 왼쪽으로 옮겨주고, 아이콘 모양도 wrap text 를 표현하는 아이콘으로 변경해줘.
- TAT와 M/M 컬럼도 width 변경가능하도록 수정해줘. 
- key deliverables의 컬럼 width를 main contents가 제일 많이 보이도록 조정해줘. due와 complete에서 시간정보는 제외하고, 날짜가 두줄료 표시되지 않는 선에서.
- key deliverables의 checkbox는 최초 한번만 메인 페이지에서 mark가 가능하고, 그 이후에는 edit모드에서만 수정이 가능하도록 해줘. 
- key deliverables의 게시판 높이가 왼쪽 engineering acitivy 게시판 (tools 정보 포함 높이)과 동일하도록 수정해줘. 
- Activity table의 게시글이 몇개 없을경우, key information과 risk 게시판이 너무 작아지는 문제가 있어. Activity table의 높이가 변하지 않도록 해줘.
- 마일스톤 축소된 상태에서 배경색이 파란색인데, 배경색은 제거하고, 대신 각 월별 수직 구분선을 추가해줘. (기본 마일스톤 그래프와 유사하게)

# 수정 포인트 V13
- Key deliverables checkbox는 그냥 단순히 클릭하는게 아니고, 실제 해당 산출물을 첨부하면 check mark가 되도록 변경해줘. 
- 각 item 내용 옆에 파일 첨부 아이콘을 추가해서, 그 아이콘을 누르면 게시글 작성 윈도우가 나타나고, 개발 히스토리등을 입력하고 산출물을 첨부할 수 있도록 해줘. 최종 해당 게시글을 저장하면 check mark가 되도록 해줘. 
- 추후에도 언제든지 해당 산출물을 클릭하면, 관련 개발 히스토리 게시글을 볼 수 있어야해. 
- 추가로 main page에서 완료된 산출물 제목 옆에도 클립 모양 아이콘을 추가해서, 게시글을 열지 않아도 첨부 파일은 바로 확인 할 수 있도록 해줘. 
- Activity 게시판에 attach files는 edit botton을 눌러서 편집모드로 들어갔을 때만 보이게 해줘. 
- 첨부파일이 포함되어 있는 게시글은 클립모양 아이콘을 제목 옆에 추가해서, 첨부파일이 포함되어 있음을 보여줘. 
- engineering actitivy 게시판과 key deliverables 게시판의 가로 사이즈가 다른데, 동일하게 50%:50% 차지하도록 수정해주고, key deliverables의 due, complete date column width를 조금만 더 줄여줘. 

# 수정 포인트 V14
- key deliverables의 완료된 산출물의 경우, 이미 첨부파일이 포함되어 클림 아이콘이 보이기 때문에, 첨부 입력을 위한 클립아니콘은 보이지 않게 업데이트해줘. 
- 현재는 산출물의 제목을 변경할 수 있는 방법이 없어. Edit button을 토글한 후, 산출물을 선택했을때는 제목을 수정할 수 있는 모드로 만들어줘. 
- 완료된 산출물을 선택했을때는 편집모드가 아니고 읽기 모드로 열리도록하고, 연필모양 아이콘을 추가해서, edit mode로 변경했을때만 편집모드로 열리도록 해줘. 
- RISK 게시판의 Potential risk를 선택하면 메인 페이지에 띄우지말고 팝업 윈도우로 보여주도록 해줘. 
- Activity 게시글 작성할 때, 관련 Key deliverables를 선택할 수 있도록 column을 추가해줘. 
- drop down 메뉴에서, 해당 activity와 연관되어 있는 Key deliverables를 선택할 수 있게 만들어줘. 
- 그리고 이 정보를 활용해서, 게시판의 필터링 기능을 추가해줘. 필터에서 원하는 key deliverables를 선택하면 해당 key deliverables에 관련된 게시글만 보이도록 해줘. 
- key deliverables의 일정들이 처음에 등간격으로 설정을 해서, 현실에 맞지 않으니깐, 실제 과제를 진행할 경우를 가정해서 현실적인 일정으로 업데이트해줘. 
- Risk 게시판에서 due 컬럼은 삭제해주고, title의 width를 더 넓혀줘. 
- activity게시판은 updated column width를 더 줄여주고, owner, due 컬럼도 width를 좀 줄여서, title width공간을 확보해줘. 
- acitivy, key infor/risk 게시판도 가로 폭이 50%:50%으로 동일하도록 맞춰줘. 

# 수정 포인트 V15
- Activity board에 key deliverable column이 없어. 첫 컬럼으로 추가해줘. main page의 게시판에는 자리가 협소하니 포함하지 않아도 돼. 
- Activity board를 open 했을 때는 key deliverables colomn이 표시되어야 하고, 여기서도 동일하게 필터 기능이 가능해야해. 
- 오늘 날짜를 가리키는 세로 라인이 실제 날짜와 align이 안되어 있어. align되도록 고쳐줘. 

# 수정 포인트 V16
- Main page 제일 상단에, 과제명 바로 오른쪽에 kick-off 일정과, MTO, MP일정을 표시해줘. 
- Stage의 완료 일정과 key deliverables의 제일 마지막 due date이 일치해야 할 것 같은데, 일치하지 않는 stage가 있어. 일치하도록 업데이트 해줘. 

# 수정 포인트 V17
- 간트차트 옵션을 추가하고 싶은데, 우선 예제로 하나만 먼들어서 추가해줘. 예제는 RTL design & Integration 스테이지의 Engineering activity와 산출물 일정에 대해서 간트차트로 만들어주고,간트차트는 chart icon을 wrap text icon 왼쪽에 추가해서 그 아니콘을 클리하면 간트차트가 그 아이콘과 게시판 table 사이에 나타나도록 해줘. 우선 결과물을 확인해보고 전체 반영할지 결정할께.

# 수정 포인트 V18
- 간트차트의 가로 사이즈는 engineering activity와 key deliverables 모두 합친 크기로 해주고, 그 차트아래에 두개 게시판이 보이도록 배치해줘. 
- 간트차트에서 key deliverables는 그 산출물이 만들어지는 activity의 막대그래프 위에 표시되도록 merge해줘. 
- 그리고 시작 일정은 k/n 지점으로 하지 말고, 전체 stage의 시작일은 있으니깐, 첫번째 activity의 시작일정이 기준이 되고, 다른 activity들의 시작일정은 실제 과제 진행을 가정했을 때, 현실적인 일정으로 지정해줘. 

# 수정 포인트 V19
- 생성된 간트차트의 월 정보에 연도 표시가 없는데, main milestone과 유사하게 Jan는 년도 표시를 추가해줘. 
- 그 다음에 나머지 스테이지들도 08.RTL 스테이지와 동일한 방식으로 간트차트를 적용해줘. 

# 수정 포인트 V20
- 간트차트 위에 있는 Engineering/program title과 Key delieverables title이 간트 차트 아래로 옮겨져서 게시판 위에 배치되도록 수정해줘.

# 수정 포인트 V21
- .json file은 각 engineering activity의 상세페이지 정보를 가지고 있는데, 이 정보를 사용해서, 각 activity를 선택하면 상세페이지로 이동해서 내용을 확인할 수 있도록 해줘. 
- 각 activity detail view에서, how it gets there part의 what it adds 컬럼이 각 step의 산출물을 보여주고 있는데, 여기에 해당 산출물을 첨부할 수 있는 기능이 필요해.
- 해당 산출물이 첨부가 되면 해당 step은 완료가 되고, 그 정보를 기준으로 각 acitivy의 진행률이 업데이트 되도록 해줘. 진행률은 main page의 engineering activity board에 표시되도록 해줘.

# 수정 포인트
- main page: 
    1. search program 기능이 동작을 하지 않아. 동작하게 고쳐줘. 
- AtlasAX1: 
    1. Overview page에서 제일 확인하고 싶은게 무엇일지 고민해봐야 해. TPM으로서 가장 최우선 적으로 확인하고 챙겨야 하는 항목에 대한 정보가 있어야 하고. 그 항목에 대해서, 바로 action을 취할 수 있는 방법이 있어야 해. 
    2. Schedule bar graph가 있긴한데, 여기서 어떤 정보를 전달하고 싶은건지 잘 모르겠어. 아무런 정보가 없어 보여. 적어도 10개 정도의 중요 milestone의 정보는 확실히 보여줘야해. 
일단 이 두 페이지 부터 수정해보자. 





# 수정 포인트 V12
- Engineering activity의 상세페이지를 만들어야해, acitivity를 하나 선택하면, pop-up window가 뜨면서, 해당 activity의 목적, 업무 flow, 관련 산출물과 key deliverables와의 관계설명. TAT, M/M등 모든 내용의 상세정보를 볼 수 있도록 해야해. 
- 일단 이 상세페이지 작성을 위해, 예제로 product definition의 첫번째 activitiy인 DEF-01에 대한 상세페이지를 html로 만들어줘. 

# 수정 포인트 V13
- 게시글 작성할 때, 관련 Engineering activity를 선택할 수 있도록 column을 추가해줘. 
- drop down 메뉴에서, 해당 activity가 속한 Engineering activity를 선택할 수 있게 만들어줘. 
- 그리고 이 정보를 활용해서, 게시판의 필터링 기능을 추가해줘. 필터에서 원하는 engineering activity를 선택하면 해당 activity에 관련된 게시글만 보이도록 해줘. 
- 

# After pushing and sync at vercel
# revision points #1
- timeline 화면에서 edit template 버튼 기능 재 검토 필요. 
-  