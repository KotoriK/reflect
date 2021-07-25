const LOCALE = Object.fromEntries(
    [
        ["4433", "中画幅（4433）"],
        ["135", "全画幅（135画幅）"],
        ["4x5", "大画幅(4x5)"],
        ["6x9", "中画幅(6x9)"],
        ["6x8", "中画幅(6x8)"],
        ["6x7", "中画幅(6x7)"],
        ["6x4.5", "中画幅(6x4.5)"],
        ["super35", "Super 35mm"],
        ["APS-H(Canon)", "APS-H(Canon)"],
        ["APS-C(Canon)", "APS-C(Canon)"],
        ["APS-C", "APS-C"],
        ["APS-C(Sigma)", "APS-C(Sigma)"],
        ["4/3", "4/3系统、M43系统"],
        ["1inch", "1英寸"],
        ["super16", "Super 16mm"],
        ["1/1.7inch", "1/1.7英寸"],
        ["1/3inch", "1/3英寸"],
        ["", "请选择..."]
    ].map(([key, value]) => ['sensor_size.' + key, value]))
export default LOCALE