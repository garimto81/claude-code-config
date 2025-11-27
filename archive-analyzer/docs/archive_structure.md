# 아카이브 폴더 구조

> 생성일: 2025-11-27

---

## 폴더 구조 다이어그램

![Folder Structure](diagrams/folder_structure.png)

---

<details>
<summary>Mermaid 코드 보기</summary>

```mermaid
flowchart TD
    ARCHIVE["📁 ARCHIVE"]

    ARCHIVE --> WSOP["📁 WSOP"]
    ARCHIVE --> HCL["📁 HCL"]
    ARCHIVE --> PAD["📁 PAD"]
    ARCHIVE --> MPP["📁 MPP"]
    ARCHIVE --> GGMillions["📁 GGMillions"]

    %% WSOP 하위
    WSOP --> PRE2016["📁 WSOP ARCHIVE (PRE-2016)"]
    WSOP --> WSOP_BR["📁 WSOP-BR"]
    WSOP --> WSOP_C["📁 WSOP-C"]
    WSOP --> WSOP_SC["📁 WSOP-SC"]

    %% PRE-2016 하위
    PRE2016 --> Y2003_2010["📁 WSOP Archive (2003-2010)"]
    PRE2016 --> Y2011_2016["📁 WSOP Archive (2011-2016)"]
    PRE2016 --> Y1973_2002["📁 WSOP Archive (1973-2002)"]

    %% 2003-2010 하위
    Y2003_2010 --> W2003["📁 WSOP 2003"]
    Y2003_2010 --> W2004["📁 WSOP 2004"]
    Y2003_2010 --> W2005["📁 WSOP 2005"]
    Y2003_2010 --> W2006["📁 WSOP 2006"]
    Y2003_2010 --> W2007["📁 WSOP 2007"]
    Y2003_2010 --> W2008["📁 WSOP 2008"]
    Y2003_2010 --> W2009["📁 WSOP 2009"]
    Y2003_2010 --> W2010["📁 WSOP 2010"]

    W2009 --> W2009_M["📁 Masters"]
    W2010 --> W2010_M["📁 Masters"]

    %% 2011-2016 하위
    Y2011_2016 --> W2011["📁 WSOP 2011"]
    Y2011_2016 --> W2012["📁 WSOP 2012"]
    Y2011_2016 --> W2013["📁 WSOP 2013"]
    Y2011_2016 --> W2014["📁 WSOP 2014"]
    Y2011_2016 --> W2015["📁 WSOP 2015"]
    Y2011_2016 --> W2016["📁 WSOP 2016"]

    %% 1973-2002 하위
    Y1973_2002 --> Y1981["📁 1981"]
    Y1973_2002 --> Y1983["📁 1983"]
    Y1973_2002 --> Y1987["📁 1987"]
    Y1973_2002 --> Y1993["📁 1993"]
    Y1973_2002 --> Y1995["📁 1995"]
    Y1973_2002 --> Y1997["📁 1997"]
    Y1973_2002 --> Y1998["📁 1998"]
    Y1973_2002 --> Y2002["📁 2002"]

    %% WSOP-BR 하위
    WSOP_BR --> EUROPE["📁 WSOP-EUROPE"]
    WSOP_BR --> PARADISE["📁 WSOP-PARADISE"]
    WSOP_BR --> LASVEGAS["📁 WSOP-LAS VEGAS"]

    EUROPE --> EU2024["📁 2024 WSOP-Europe"]
    EUROPE --> EU2025["📁 2025 WSOP-Europe"]

    %% WSOP-C 하위
    WSOP_C --> WSOP_C_LA["📁 2024 WSOP-C LA"]

    %% WSOP-SC 하위
    WSOP_SC --> SC2025["📁 2025 WSOP-SC (Cyprus)"]

    %% HCL 하위
    HCL --> HCL2025["📁 2025"]
    HCL --> HCL_CLIP["📁 HCL Poker Clip"]

    %% PAD 하위
    PAD --> PAD_S12["📁 PAD S12"]
    PAD --> PAD_S13["📁 PAD S13"]

    %% MPP 하위
    MPP --> MPP_GF["📁 $2M GTD Grand Final"]
    MPP --> MPP_ME["📁 $5M GTD Main Event"]
    MPP --> MPP_MB["📁 $1M GTD Mystery Bounty"]
```
</details>

---

## 텍스트 트리 구조

```
ARCHIVE/
├── WSOP/
│   ├── WSOP ARCHIVE (PRE-2016)/
│   │   ├── WSOP Archive (2003-2010)/
│   │   │   ├── WSOP 2003/
│   │   │   ├── WSOP 2004/
│   │   │   ├── WSOP 2005/
│   │   │   ├── WSOP 2006/
│   │   │   ├── WSOP 2007/
│   │   │   ├── WSOP 2008/
│   │   │   ├── WSOP 2009/
│   │   │   │   └── Masters/
│   │   │   └── WSOP 2010/
│   │   │       └── Masters/
│   │   ├── WSOP Archive (2011-2016)/
│   │   │   ├── WSOP 2011/
│   │   │   ├── WSOP 2012/
│   │   │   ├── WSOP 2013/
│   │   │   ├── WSOP 2014/
│   │   │   ├── WSOP 2015/
│   │   │   │   └── Main Event MOVs/
│   │   │   └── WSOP 2016/
│   │   │       └── Main Event MXFs/
│   │   └── WSOP Archive (1973-2002)/
│   │       ├── 1981/
│   │       ├── 1983/
│   │       ├── 1987/
│   │       ├── 1988/
│   │       ├── 1989/
│   │       ├── 1993/
│   │       ├── 1995/
│   │       ├── 1997/
│   │       ├── 1998/
│   │       └── 2002/
│   ├── WSOP-BR/
│   │   ├── WSOP-EUROPE/
│   │   │   ├── 2024 WSOP-Europe/
│   │   │   └── 2025 WSOP-Europe/
│   │   │       ├── 2025 WSOP-EUROPE MAIN EVENT/
│   │   │       │   └── NO COMMENTARY WITH GRAPHICS VER/
│   │   │       │       ├── Day 1 A/
│   │   │       │       ├── Day 1 B/
│   │   │       │       ├── Day 2/
│   │   │       │       ├── Day 3/
│   │   │       │       └── Day 4/
│   │   │       ├── 2025 WSOP-EUROPE 2K MONSTERSTACK FINAL/
│   │   │       └── 2025 WSOP-EUROPE 10K PLO MY.BO FINAL/
│   │   ├── WSOP-PARADISE/
│   │   │   ├── 2023 WSOP-PARADISE/
│   │   │   └── 2024 WSOP-PARADISE SUPER MAIN EVENT/
│   │   └── WSOP-LAS VEGAS/
│   │       ├── 2024 WSOP-LAS VEGAS (PokerGo Clip)/
│   │       └── 2025 WSOP-LAS VEGAS/
│   ├── WSOP-C/
│   │   └── 2024 WSOP-C LA/
│   │       ├── 2024 WSOP-C LA STREAM/
│   │       └── 2024 WSOP-C LA SUBCLIP/
│   └── WSOP-SC/
│       └── 2025 WSOP-SC (Cyprus)/
│           └── $5M GTD WSOP Super Circuit Cyprus Main Event 2025/
├── HCL/
│   ├── 2025/
│   └── HCL Poker Clip/
├── PAD/
│   ├── PAD S12/
│   └── PAD S13/
├── MPP/
│   ├── $2M GTD $2K Luxon Pay Grand Final/
│   ├── $5M GTD $5K MPP Main Event/
│   └── $1M GTD $1K PokerOK Mystery Bounty/
└── GGMillions/
```
